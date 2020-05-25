import React, { useState, useEffect } from 'react';
import QuestionnaireResult　　　　　   from './QuestionnaireResult';
import { toHalfWidthNumber, extractionNumber } from './formatter/textFormatter';

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
    const { questionnaireList, questionnaireTitle, restart, reload, startObserveFlag, deleteQuestionnare, initQuestionnaire, changePropsObserveFlag, changeRestart, changeReload, historyRefresh, changeHistoryState } = props;

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

    const startObserve = () => {
        const commentElement = document.getElementById('chat');

        if (commentElement.length < 1) {
            return false;
        }

        /*****  コメント欄observe *****/
        // コメント欄はiframe
        const iframeContents = commentElement.getElementsByTagName('iframe')[0].contentWindow.document.querySelector('#item-offset #items');
        // コメント欄監視
        commentObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((contents) => {
                    const message = contents.querySelector('#message').innerText;

                    let targetMessage = toHalfWidthNumber(extractionNumber(message));

                    // アンケートと関係ないコメントの場合return
                    if (!targetMessage) {
                        return;
                    }

                    if (parseInt(targetMessage) > questionnaireList.length || parseInt(targetMessage) <= 0) {
                        return;
                    }

                    contents.children[0].getElementsByTagName('img')[0].onload = () => {
                        const uniqImageUrl = contents.children[0].getElementsByTagName('img')[0].getAttribute('src').split('/');
                        const uniqId = uniqImageUrl[3] + uniqImageUrl[4] + uniqImageUrl[5] + uniqImageUrl[6];

                        // useEffect発火
                        setNewUser(() => ({[uniqId]: targetMessage}));
                    }
                })
            });
        });

        commentObserver.observe(iframeContents, {
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
        <div class='questionnaire__result'>
            <QuestionnaireResult
                userList={userList}
                filter={filter}
                votes={votes}
                startObserveFlag={startObserveFlag}
                questionnaireList={questionnaireList}
                questionnaireTitle={questionnaireTitle}
                changeFilter={(flag) => changeFilter(flag)}
                deleteQuestionnare={(index) => deleteQuestionnare(index)}
            >
            </QuestionnaireResult>
            {startObserveFlag ? (
                <div class="btn__wrap">
                    <p class='btn btn__aggregate'>集計中</p>
                    <p class='btn btn__aggregate'>現在投票数：{Object.keys(userList).length}</p>
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
                        </div>
                    )
                    : (
                        <div class='btn__wrap'>
                            <p class='btn btn__aggregate'>現在投票数：{Object.keys(userList).length}</p>
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
            <input
                type='checkbox'
                id='filter'
                name='filter'
                onChange={() => changeFilter(!filter)}
                checked={filter ? 'checked' : ''}
            />

            <label class="checkbox-icon">チェックを外すと投票%が開示された状態になります</label>
            <br />
            <p class='questionnaire__Title'>2. 設定した内容が反映されます↓</p>
            <p class='questionnaire__subText'>項目を設定後、「アンケートを開始する」を押すと集計が始まります。</p>

            <p class='questionnaire__subText'>例：）「1: 項目」が登録されてる場合、1というコメントが「項目」の票数にカウントされます。</p>
            <p class='questionnaire__subText'>数字のコメントを拾います。</p>

        </div>
    );
}
