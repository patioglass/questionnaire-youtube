import React, { useState, useEffect } from 'react';
import QuestionnaireResult　　　　　   from './QuestionnaireResult';
import DownloadButton                 from './DownloadButton';

let commentObserver = {};
const spStr = [
    11, // 垂直タブ
    8203 // ゼロ幅スペース
];

export default function CommentMutationObserver(props) {
    const [ userList, setUserList ] = useState({});                     // ユーザ：投票
    const [ newUser, setNewUser ] = useState({});                       // observe側で拾った新規投票(ユーザ：投票)
    const [ votes, setVotes ] = useState([]);                           // 項目：投票数

    const [ observeComplete, setObserveComplete ] = useState(false);    // observer起動確認用
    const [ filter, setFilter ] = useState(true);                       // %の表示非表示
    const [ startButtonClass, setStartButtonClass ] = useState('btn__inactive');  // アンケート開始のtoggle
    const [ historyButtonClass, setHistoryButtonClass ] = useState('btn__inactive');  // 履歴保存ボタンのtoggle
    const [ historySave, setHistorySave ] = useState(false);

    // todo: props地獄なのでなんとかしたい
    const {
        questionnaireList,
        questionnaireTitle,
        showTitle,
        showVoteCount,
        restart,
        reload,
        startObserveFlag,
        deleteQuestionnare,
        initQuestionnaire,
        changePropsObserveFlag,
        changeRestart,
        changeReload,
        historyRefresh,
        changeHistoryState,
        changeShowTitleFlag,
        changeShowVoteCountFlag,
        subWindow
    } = props;

    // 新規投票(newUser) or コメント欄監視開始(startObserveFlag) or アンケート項目追加/削除(questionnaireList) or ページ遷移reload
    useEffect(() => {

        if (reload) {
            finishObserve();
            resetState();
            changeReload(false);
        }
        // observe初期化設定、レンダリング待ち用
        if (!observeComplete && startObserveFlag && !restart) {
            const initObserve = setInterval(() => {

                if (startObserve()) {
                    // 投票数0初期化
                    setVotes(questionnaireList.map((questionnaire, index) => {
                        return 0;
                    }));
                    setObserveComplete(true);
                    setNewUser({});
                    setUserList({});
                    clearInterval(initObserve);
                }
            }, 500);
        }
        if (startObserveFlag) {
            // 新規投票登録
            Object.keys(newUser).forEach((key) => {
                if (!userList[key]) {
                    console.log('登録：'+ newUser[key]);

                    changeVotes(newUser[key], 1);
                    setUserList(list => ({...list, [key]: newUser[key]}));
                }
            })
        }

        // 項目が登録されていればアンケート開始可能
        if (questionnaireList.length > 1) {
            setStartButtonClass('btn__startQuestionnaire');
        } else {
            setStartButtonClass('btn__startInactive');
        }

        if (questionnaireTitle) {
            setHistoryButtonClass("btn__saveHistory");
        } else {
            setHistoryButtonClass("btn__historyInactive");
        }
    }, [newUser, startObserveFlag, questionnaireList, questionnaireTitle])

    const changeObserve = (flag) => {
        if (questionnaireList.length > 0) {
            changePropsObserveFlag(flag);
        }
    }

    const changeFilter = (flag) => {
        setFilter(flag);
    }

    // アンケート終了
    const finishObserve = () => {
        if (observeComplete) {
            commentObserver.disconnect();
        }
        changePropsObserveFlag(false);

        // アンケート終了後にfilterを解除
        changeFilter(false);
        setStartButtonClass('btn__inactive');
        setObserveComplete(false);
        setNewUser({});

        changeRestart(true);
    }

    // アンケート再実施
    const retryState = () => {
        setUserList({});
        setVotes([]);
        changeFilter(true);

        changeRestart(false);
    }

    // アンケート作り直し
    const resetState = () => {
        initQuestionnaire();
        setUserList({});
        setVotes([]);
        changeFilter(true);

        changeRestart(false);
    }

    const changeVotes = (index, count) => {
        votes[Number(index) - 1] += count;
        setVotes(() => votes);
    }

    const changeShowVoteCount = (flag) => {
        changeShowVoteCountFlag(flag);
    }

    const changeShowTitle = (flag) => {
        changeShowTitleFlag(flag);
    }

    const startObserve = () => {
        const commentElement = document.getElementById('chat');

        if (!commentElement || commentElement.length < 1) {
            return false;
        }

        /*****  コメント欄observe *****/ 
        // コメント欄はiframe

        if (commentElement.querySelector('#items')) {
            console.log("not ifame");
        } else {
            console.log("ifame");
        }

        const commentContents = commentElement.querySelector('#items')
            ? commentElement.querySelector('#items')
            : commentElement.getElementsByTagName('iframe')[0].contentWindow.document.querySelector('#item-offset #items');

        // コメント欄監視
        commentObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((contents) => {
                    const message = contents.querySelector('#message').innerText;

                    // 特殊文字削除
                    let targetMessage = '';
                    for (let i = 0; i < message.length; i++) {
                        const charCode = message.charCodeAt(i);
                        if (spStr.indexOf(charCode) === -1) {
                            targetMessage += String.fromCharCode(charCode);
                        }
                    }
                    // アンケートと関係ないコメントの場合return
                    if (!targetMessage || !targetMessage.match(/^[1-9][0-9]*$/)) {
                        return;
                    }

                    if (parseInt(targetMessage) > questionnaireList.length || parseInt(targetMessage) <= 0) {
                        return;
                    }

                    const iconImage = contents.children[0].getElementsByTagName('img')[0];
                    if (iconImage.parentNode.getAttribute('id') === 'author-photo') {
                        iconImage.onload = () => {
                            const uniqImageUrl = iconImage.getAttribute('src').split('/');

                            const uniqId = uniqImageUrl[3] + uniqImageUrl[4];

                            // useEffect発火
                            setNewUser(() => ({[uniqId]: targetMessage}));
                            iconImage.onload = null;
                        }
                    }
                })
            });
        });
     
        commentObserver.observe(commentContents, {
            childList:  true
        })
        /*****  コメント欄observe *****/ 

        return true;
    }

    const saveHistory = () => {
        if (questionnaireTitle) {
            let currentNum = 0;

            for (let key in localStorage) {
                if (key.match(/patio/)) {
                    currentNum += 1;
                }
            }

            // タイトル,アンケート項目1,アンケート項目2...となるように整形する
            localStorage.setItem('questionnaire::patio' + currentNum, questionnaireTitle + "," + questionnaireList.join());
            changeHistoryState(!historyRefresh);
            setHistorySave(true);
            setTimeout(setHistorySave, 3000, false);
        }
    }
    return (
        <div class='questionnaire__result' id="questionnaire__result">
            <QuestionnaireResult 
                userList={userList}
                filter={filter}
                showVoteCount={showVoteCount}
                showTitle={showTitle}
                votes={votes}
                startObserveFlag={startObserveFlag}
                questionnaireList={questionnaireList}
                questionnaireTitle={questionnaireTitle}
                changeFilter={(flag) => changeFilter(flag)}
                deleteQuestionnare={(index) => deleteQuestionnare(index)}
            >
            </QuestionnaireResult>
            <div id="other_than_result_window">
                {startObserveFlag ? (
                    <div class="btn__wrap">
                        <p class="btn btn__detail">(参加方法：半角1~{questionnaireList.length}のコメントで投票に参加できます)</p>
                        <p class='btn btn__aggregate'>集計中</p>
                        <br />
                        <br />
                        <br />
                        <p class='btn btn__startQuestionnaire' onClick={finishObserve}>アンケートを終了する</p>
                    </div>
                ) : (
                    <>
                        {restart ? (
                            <div class='btn__wrap'>
                                <p class='btn btn__finishQuestionnaire' onClick={resetState}>アンケートを作り直す</p>
                                <p class='btn btn__retryQuestionnaire' onClick={retryState}>同じアンケートをもう一度する</p>
                                <br />
                                <DownloadButton subWindow={subWindow}></DownloadButton>
                            </div>
                        )
                        : (
                            <div class='btn__wrap'>
                                <p class={'btn ' + startButtonClass} onClick={() => changeObserve(true)}>アンケートスタート</p>
                                <p class={'btn ' + historyButtonClass} onClick={saveHistory}>アンケート内容を保存する</p>
                                <p
                                    style={{
                                        transition: '1s',
                                        opacity: historySave ? 1 : 0
                                    }}
                                >保存完了しました</p>
                            </div>
                        )}
                    </>
                )}

                <br />
                <br />
                <br />
                <h2>UI制御について</h2>
                <input
                    type='checkbox'
                    id='showTitle'
                    name='showTitle'
                    onChange={() => changeShowTitle(!showTitle)}
                    checked={showTitle ? 'checked' : ''}
                />
                <label class="checkbox-icon">チェックを外すとタイトルの灰色の部分を非表示にできます</label>

                <br />

                <input
                    type='checkbox'
                    id='showVoteCount'
                    name='showVoteCount'
                    onChange={() => changeShowVoteCount(!showVoteCount)}
                    checked={showVoteCount ? 'checked' : ''}
                />
                <label class="checkbox-icon">チェックを外すとオレンジの投票数を非表示にできます</label>

                <br />

                <input
                    type='checkbox'
                    id='filter'
                    name='filter'
                    onChange={() => changeFilter(!filter)}
                    checked={filter ? 'checked' : ''}
                />
                <label class="checkbox-icon">チェックを外すと投票%が開示された状態になります(リアルタイムで数字の変化を見たい人向け)</label>
                <br />
                <br />
                <h2>その他説明</h2>
                <p class='questionnaire__subText'>項目を設定後、「アンケートを開始する」を押すと集計が始まります。</p>

                <p class='questionnaire__subText'>例：）「1: 項目」が登録されてる場合、1というコメントが「項目」の票数にカウントされます。</p>
                <p class='questionnaire__subText'>数字のコメントを拾います。</p>

            </div>
        </div>
    );
}
