import React, { useState }     from 'react';
import ReactDOM                from 'react-dom';

import CommentMutationObserver from './CommentMutationObserver';
import InputForm               from './InputForm';
import * as subWindowCss            from '../css/subWindow';

let subWindow = null;
let subRoot = null;

export default function Questionnaire() {
    const [ questionnaireTitle, setQuestionnaireTitle] = useState('');  // アンケートタイトル
    const [ questionnaireList, setQuestionnaireList ] = useState([]);   // アンケート項目
    const [ startObserveFlag, setStartObserveFlag ] = useState(false);  // アンケート開始ボタンの押下判定(inputの制御、observeの制御用)
    const [ restart, setRestart ] = useState(false);                    // アンケート作り直し押下判定
    const [ liveContents, setLiveContents ] = useState(false);           // ライブ配信判定
    const [ isQuestionnaire, setQuestionnaire ] = useState(false);      // アンケート開始フラグ
    const [ reload, setReload ] = useState(false);
    const [ historyRefresh, setHistoryRefresh ] = useState(false);
    const [ latestCssData, setLatestCssData ] = useState('');           // 一番最後に読み込んだcss
    const [ latestCssTitle, setLatestCssTitle ] = useState('');         // 一番最後に読み込んだcssのファイル名
    const [ showTitle, setShowTitle] = useState(true);                  // アンケート画面のタイトルの表示非表示
    const [ showVoteCount, setShowVoteCount] = useState(true);          // アンケート画面の投票数の表示非表示

    // localStorageが使えるかどうか
    const canLocalStorage = window.localStorage;

    const updateQuestionnaire = (inputQuestionnaire) => {
        const newQuestionnaire = new Array(inputQuestionnaire);
        setQuestionnaireList((questionnaireList) => questionnaireList.concat(newQuestionnaire));
    }
    
    const updateTitle = (inputTitle) => {
        setQuestionnaireTitle(inputTitle);
    }

    const deleteQuestionnare = (index) => {
        const newQuestionnaire = questionnaireList.filter((val, i) => i !== index);
        setQuestionnaireList(() => newQuestionnaire);
    }

    const initQuestionnaire = () => {
        setQuestionnaireList(() => []);
        setQuestionnaireTitle('');
    }

    const changeObserveFlag = (flag) => {
        setStartObserveFlag(flag);
    }
    
    const changeRestart = (flag) => {
        setRestart(flag);
    }

    const changeQuestionnaire = (state) => {
        setQuestionnaire(state);
    }
    
    const changeReload = (state) => {
        setReload(state);
    }

    const changeHistoryState = (state) => {
        setHistoryRefresh(state);
    }

    const changeShowTitleFlag = (state) => {
        chrome.storage.local.set({'showTitleFlag::questionnare-youtube': state ? 'true' : 'false'}, ()=>{});
        setShowTitle(state);
    }

    const changeShowVoteCountFlag = (state) => {
        chrome.storage.local.set({'showVoteCountFlag::questionnare-youtube': state ? 'true' : 'false'}, ()=>{});
        setShowVoteCount(state);
    }

    const subWindowClose = () => {
        changeQuestionnaire(false);
        setReload(true);
        subWindow = null;
        subRoot = null;
    }

    // 前回読み込んだcssの生データを取得
    chrome.storage.local.get("cssData::questionnare-youtube", (value) => {
        setLatestCssData(value['cssData::questionnare-youtube']);
    });
    chrome.storage.local.get("cssTitle::questionnare-youtube", (value) => {
        setLatestCssTitle(value['cssTitle::questionnare-youtube']);
    });

    // 前回のチェックボックスを復元
    chrome.storage.local.get("showTitleFlag::questionnare-youtube", (value) => {
        const flag = (value['showTitleFlag::questionnare-youtube'] === 'true' || value['showTitleFlag::questionnare-youtube'] === '');
        setShowTitle(flag);
    });
    chrome.storage.local.get("showVoteCountFlag::questionnare-youtube", (value) => {
        const flag = (value['showVoteCountFlag::questionnare-youtube'] === 'true' || value['showVoteCountFlag::questionnare-youtube'] === '')
        setShowVoteCount(flag);
    });


    if (liveContents && isQuestionnaire) {
        if (subRoot === null) {
            subWindow = window.open('about:blank', null, 'resizable=no,scrollbars=yes,status=no');
            subRoot = subWindow.document.createElement('div');
            subWindow.document.body.appendChild(subRoot);

            const subHead = subWindow.document.head;
            const subStyle = subWindow.document.createElement('style');
            subStyle.textContent = subWindowCss.subWindowCss;
            subHead.appendChild(subStyle);

            if (latestCssData) {
                const addSubStyle = subWindow.document.createElement('style');
                addSubStyle.textContent = latestCssData;
                subHead.appendChild(addSubStyle);
            }

            subWindow.addEventListener('unload', subWindowClose);
        }
        ReactDOM.render(
            <CommentMutationObserver 
                questionnaireList={questionnaireList}
                questionnaireTitle={questionnaireTitle}
                showTitle={showTitle}
                showVoteCount={showVoteCount}
                restart={restart}
                reload={reload}
                liveContents={liveContents}
                changeRestart={changeRestart}
                startObserveFlag={startObserveFlag}
                deleteQuestionnare={(index) => deleteQuestionnare(index)}
                initQuestionnaire={initQuestionnaire}
                changePropsObserveFlag={(flag) => changeObserveFlag(flag)}
                changeReload={(state) => changeReload(state)}
                historyRefresh={historyRefresh}
                changeHistoryState={(state) => changeHistoryState(state)}
                changeShowTitleFlag={(state) => changeShowTitleFlag(state)}
                changeShowVoteCountFlag={(state) => changeShowVoteCountFlag(state)}
                subWindow={subWindow}
            >
            </CommentMutationObserver>
            , subRoot);
    }

    // cssファイルを読み込む
    const changeCssFile = (e) => {
        const reader = new FileReader();
        reader.readAsText(e.target.files[0]);

        reader.addEventListener( 'load', {cssTitle: e.target.files[0].name, handleEvent: function() {
            const targetCss = reader.result;
            // 最新の読み込んだcssをchrome.storageに保存
            chrome.storage.local.set({'cssData::questionnare-youtube': targetCss}, ()=>{});
            chrome.storage.local.set({'cssTitle::questionnare-youtube': this.cssTitle}, ()=>{});

            // すでに読み込んでいた場合、前のものを削除
            if (subWindow.document.styleSheets.length > 1) {
                subWindow.document.getElementsByTagName('style')[1].remove();
            }
            const subHead = subWindow.document.head;
            const subStyle = subWindow.document.createElement('style');
            subStyle.textContent = targetCss;
            subHead.appendChild(subStyle);
        }})
    }

    // 履歴にあるアンケートを読み込む
    const selectedHistory = () => {
        const selectValue = document.getElementById("selectedHistory").value;
        let newQuestionnaire = [];
        localStorage.getItem(selectValue).split(",").forEach((val, index) => {
            // タイトル
            if (index === 0) {
                setQuestionnaireTitle(val);
            } else {
                // アンケート項目
                newQuestionnaire.push(val);
            }
        });
        setQuestionnaireList(newQuestionnaire);
    }

    const deleteHistory = () => {
        const selectValue = document.getElementById("selectedHistory").value;
        if (window.confirm( "'" + localStorage.getItem(selectValue).split(",")[0] + "' を削除しますか？")) {
            localStorage.removeItem(selectValue);
            changeHistoryState(!historyRefresh);
        }
    }

    // localStorageからアンケート履歴を取得する
    // key => アンケートのタイトル
    // value => タイトル,アンケート項目1,アンケート項目2,....
    const historyOptions = Object.keys(localStorage).map((key) => {
        if (key.match(/patio/)) {
            const historyValue = localStorage[key].split(",");
            return <option value={key}>{historyValue[0]}</option>
        }
    }).filter((e) => {return e !== undefined;})

    return (
        <>
        {liveContents ? (
        <div class='questionnaire'>
            <p class='questionnaire__title'>【 アンケート機能 】</p>
            <p class='questionnaire__subText'>Youtubeコメント欄の集計をとる拡張です。</p>
            <p class='btn btn__useQuestionnaire' onClick={() => changeQuestionnaire(true)}>アンケート機能画面起動</p>
            <br />
            {isQuestionnaire ? (
                <>
                <InputForm
                    updateQuestionnaire={(inputQuestionnaire) => updateQuestionnaire(inputQuestionnaire)} 
                    updateTitle={(inputTitle) => updateTitle(inputTitle)}
                    questionnaireTitle={questionnaireTitle}
                    startObserveFlag={startObserveFlag}
                    restart={restart}
                />

                <br />
                <br />
                <br />
                <h3>履歴からアンケートを作成</h3>
                    {canLocalStorage ? (
                        <>
                        {historyOptions.length > 0 ? (
                        <>
                        <select id="selectedHistory">
                            {historyOptions}
                        </select>
                        {!startObserveFlag ? (
                        <>
                        <p class="btn btn__historyButton" onClick={selectedHistory}>読み込む</p>
                        <p class="btn btn__historyDeleteButton" onClick={deleteHistory}>削除する</p>
                        </>
                        ) : ''}
                        </>
                        ) : (
                        <p>履歴はありません。</p>
                        )}
                        </>
                    ) : (
                        <>
                        <p>※現在利用されている環境では、アンケートの履歴機能を利用できません。</p>
                        <p>ブラウザを変えるなど対応してください。</p>
                        </>
                    )}

                <br />
                <br />
                <h3>外部cssを読み込む</h3>
                <br />
                {(latestCssData || latestCssTitle) ? (
                    <>
                    <p>※前回読み込んだcssが適用されています（<strong>現在のファイル：{latestCssTitle}</strong>）</p>
                    <p>更新したい場合は再度ファイルを読み込ませてください（解除したい場合は公式の提供テンプレートの「deault.css」を適用してください）</p>
                    <br />
                    </>
                ) : ''}
                <input type="file" id="cssFile" onChange={(e) => changeCssFile(e)} />
                <br />
                <br />
                <p>cssを読み込ませることでアンケート画面のデザインを変更することができます。</p>
                <p><a href="https://patio.booth.pm/items/2111600" target="_blank">公式の提供テンプレートはコチラ</a></p>
                <br />
                </>
            ) : ''}
        </div>
        ) : (
            <div>
                <p class='btn btn__useQuestionnaire' onClick={() => setLiveContents(true)}>アンケート機能を使う</p>
            </div>
        )}
        </>
    );
}