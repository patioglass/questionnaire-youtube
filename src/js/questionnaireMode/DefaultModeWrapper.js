import React, { useState } from 'react';

export default function DefaultMode(props) {
    const { questionnaireList, userList, votes, deleteQuestionnare, startObserveFlag, filter } = props;

    const questionnaireComponent = questionnaireList.map((text, index) => {
        let percentage = 0;
        const sumVoted = Object.keys(userList).length;
        // 無投票初期値は0%
        if (!sumVoted || !votes[index] || votes[index] === 0) {
            percentage = 0;
        } else {
            percentage = (Math.round(votes[index] / sumVoted * 100 * 100)) / 100; 
        }
        return <>
                <div class='questionnaire__result-item'>
                  {!startObserveFlag ? (
                      <div 
                        class='questionnaire__result-deleteButton'
                        onClick={() => deleteQuestionnare(index)}
                      >×</div>
                  ) : ''}
                  <p class='questionnaire__result-text'>{index + 1} : {text}</p>
                  {filter ? (
                      <p class='questionnaire__result-percentage'>??. ?%</p>
                  ) : (
                      <p class='questionnaire__result-percentage'>{percentage.toFixed(2)} %</p>
                  )}
                </div>
                </>
    });

    return (
        <>
        {questionnaireComponent}
        </>
    );
}