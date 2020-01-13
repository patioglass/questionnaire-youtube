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

    // ページ遷移判定用
    let currentUrl = '';

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
    
    const isLive = () => {
        const liveContents = document.getElementById('date').innerText.match(/ライブ配信開始|開始予定/);
        if (!liveContents) {
            return false;
        }
        return true;
    }

    const subWindowClose = () => {
        changeQuestionnaire(false);
        setReload(true);
        subWindow = null;
        subRoot = null;
    }

    const detectedCommentFrame = () => {
        const initObserve = setInterval(() => {
            setLoadCommentFrame(true);
            if (document.getElementsByTagName('ytd-video-owner-renderer')[0]) {
                
                setLiveContents(isLive());
                /*****  ページ全体observe *****/
                pageObserver = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'childList') {
                            if (mutation.addedNodes.length === 1 && currentUrl != window.location.href) {;
                                currentUrl = window.location.href;
                                // アンケート実施中にページ遷移したら強制リフレッシュ
                                setLoadCommentFrame(false);
                                changeLiveContents(isLive());
                                changeQuestionnaire(false);
                                setReload(true);
                            }
                        }
                    })
                });

                // ページ移動検知用observe
                pageObserver.observe(document.getElementsByTagName('ytd-video-owner-renderer')[0], {
                    childList: true,
                    subtree: true
                })
                /*****  ページ全体observe *****/
                clearInterval(initObserve);
            }
        }, 500);
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
            >
            </CommentMutationObserver>
            , subRoot);
    }
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
                </>
            ) : ''}
        </div>
        ) : (
            <div>
                <p class='btn btn__useQuestionnaire' onClick={() => detectedCommentFrame()}>アンケート機能を使う</p>
                {loadCommentFrame ? (
                    <>
                    <p>読み込み中...</p>
                    <p>※生配信中のものではない、または読み込みが終わらない場合はページリロードして再度お試しください。</p>
                    </>
                ): ''}
            </div>
        )}
        </>
    );
}