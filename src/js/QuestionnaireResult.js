import React, { useState } from 'react';

export default function QuestionnaireResult(props) {
    const { userList, filter, votes, startObserveFlag, questionnaireList, questionnaireTitle, deleteQuestionnare } = props;

    const questionnaireComponent = questionnaireList.map((text, index) => {
        let percentage = 0;
        const sumVoted = Object.keys(userList).length;
        // 無投票初期値は0%
        if (!sumVoted || !votes[index] || votes[index] === 0) {
            percentage = 0;
        } else {
            percentage = (Math.round(votes[index] / sumVoted * 100 * 100)) / 100; 
        }
        return <div class='questionnaire__result-item'>
                  {!startObserveFlag ? (
                      <div 
                        class='questionnaire__result-deleteButton'
                        onClick={() => deleteQuestionnare(index)}
                      >×</div>
                  ) : ''}
                  <p class='questionnaire__result-text'>{index + 1} : {text}</p>
                  <br />
                  {filter ? (
                      <p class='questionnaire__result-percentage'>??. ?%</p>
                  ) : (
                      <p class='questionnaire__result-percentage'>{percentage.toFixed(2)} %</p>
                  )}
              </div>
    })

    return (
        <>
        {questionnaireList.length > 1 ? (
            <p class='questionnaire__result-title'>{questionnaireTitle}<br />(半角1~{questionnaireList.length}のコメントで投票に参加できます)</p>
        ) : (
            <p class='questionnaire__result-title'>{questionnaireTitle}<br />(半角数字のコメントで投票に参加できます)</p>
        )}
        <div class='questionnaire__result-window'>
            {questionnaireComponent}
        </div>
        </>
    );
} 