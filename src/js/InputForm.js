import React, { useState } from 'react';

export default function InputForm(props) {
    const { updateQuestionnaire, updateTitle, questionnaireTitle, startObserveFlag, restart } = props;
    const [ error, setError ] = useState('');
    const addQuestionnaire = () => {
        let inputQuestionnaire = document.getElementById('questionnaire__input');
        if (inputQuestionnaire.value !== '') {
            updateQuestionnaire(inputQuestionnaire.value);
            setError('');
            inputQuestionnaire.value = '';
        } else {
            setError('※入力内容が空です');
        }
    }
    
    const changeTitle = () => {
        let inputQuestionnaireTitle = document.getElementById('questionnaire__inputTitle');
        updateTitle(inputQuestionnaireTitle.value);
    }

    return (
        <>        
        <br />
        <br />
        <div class='questionnaire__wrap-inline'>
            <p class='questionnaire__subTitle'>1. タイトル設定</p>
            <p class='questionnaire__subText'>アンケートのタイトルを入力します</p>
            <input
                type='text'
                disabled={startObserveFlag ? 'disabled' : ''}
                value={questionnaireTitle}
                id='questionnaire__inputTitle'
                onChange={changeTitle} />
        </div>
        <div class='questionnaire__wrap-inline'>

            <p class='questionnaire__subTitle'>2. アンケートの項目追加</p>
            <p class='questionnaire__subText'>アンケートの項目を追加してください</p>
            <input
                type='text'
                id='questionnaire__input'
                disabled={startObserveFlag || restart ? 'disabled' : ''} />

            <p class={startObserveFlag || restart ? 'btn__hide' : 'btn btn__addQuestionnaire'} onClick={addQuestionnaire}>追加する</p>
            {error ? (
                <p class='error'>{error}</p>
            ) : ''}
        </div>
        </>
    );
}