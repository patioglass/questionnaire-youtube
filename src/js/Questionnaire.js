import React, { useState }     from 'react';
import ReactDOM                from 'react-dom';

import CommentMutationObserver from './CommentMutationObserver';
import InputForm               from './InputForm';
import * as subWindowCss            from '../css/subWindow';

let pageObserver = {};
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
    const [ loadCommentFrame, setLoadCommentFrame ] = useState(false);
    const [ historyRefresh, setHistoryRefresh ] = useState(false);

    // ページ遷移判定用
    let currentUrl = '';

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

    const changeLiveContents = (state) => {
        setLiveContents(state);
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

    const subWindowClose = () => {
        changeQuestionnaire(false);
        setReload(true);
        subWindow = null;
        subRoot = null;
    }
    
    if (liveContents && isQuestionnaire) {
        if (subRoot === null) {
            subWindow = window.open('about:blank', null, 'resizable=no,scrollbars=yes,status=no');
            subRoot = subWindow.document.createElement('div');
            subWindow.document.body.appendChild(subRoot);

            const subHead = subWindow.document.head;
            const subStyle = subWindow.document.createElement('style');
            subStyle.textContent = subWindowCss.subWindowCss;
            subHead.appendChild(subStyle);
            subWindow.addEventListener('unload', subWindowClose);
        }
        ReactDOM.render(
            <CommentMutationObserver 
                questionnaireList={questionnaireList}
                questionnaireTitle={questionnaireTitle}
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
                subWindow={subWindow}
            >
            </CommentMutationObserver>
            , subRoot);
    }

    // cssファイルを読み込む
    const changeCssFile = (e) => {
        const reader = new FileReader();
        reader.readAsText(e.target.files[0]);
        console.log(e.target.files[0].webkitRelativePath);

        reader.addEventListener( 'load', function() {
            const targetCss = reader.result;

            // すでに読み込んでいた場合、前のものを削除
            if (subWindow.document.styleSheets.length > 1) {
                subWindow.document.getElementsByTagName('style')[1].remove();
            }
            const subHead = subWindow.document.head;
            const subStyle = subWindow.document.createElement('style');
            subStyle.textContent = targetCss;
            subHead.appendChild(subStyle);
        })
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