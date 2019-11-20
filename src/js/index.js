import React         from 'react';
import ReactDOM      from 'react-dom';
import Questionnaire from './Questionnaire';

function addQuestionnaire() {
    // 配信概要欄の要素
    const videoPrimaryInfo = document.getElementById('meta');
    if (!videoPrimaryInfo) {
        return false;
    }

    videoPrimaryInfo.insertAdjacentHTML('beforebegin','<div id="questionnaire"></div>');
    const target = document.getElementById('questionnaire');

    ReactDOM.render(<Questionnaire />, target);
    return true;
}

// レンダリング待ち用
let loading = setInterval(() => {
    if (addQuestionnaire()) {
        clearInterval(loading);
    }
}, 500);