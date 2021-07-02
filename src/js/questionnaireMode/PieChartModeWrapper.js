import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip
} from 'recharts';

import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';


export default function PieChartModeWrapper(props) {
    const { questionnaireList, userList, votes, deleteQuestionnare, startObserveFlag } = props;
    const RADIAN = Math.PI / 180;
    const COLORS = scaleOrdinal(schemeCategory10).range();
    let pieData = [];
    let currentVote = 0;

    // 円グラフ用のデータセット
    if (!startObserveFlag) {
        pieData = [{name: "empty", value: 1}];
    } else {
        pieData = questionnaireList.map((text, index) => {
            const sumVoted = Object.keys(userList).length;

            if (!sumVoted || !votes[index] || votes[index] === 0) {
                currentVote = 0;
            } else {
                currentVote = votes[index];
            }
            return {name: text, value: currentVote};
        });
    }

    // リスト表示用
    const questionnaireListData = questionnaireList.map((text, index) => {
        const colorScheme = {
            backgroundColor: COLORS[index % COLORS.length]
        }
        let percentage = 0;
        const sumVoted = Object.keys(userList).length;
        // 無投票初期値は0%
        if (!sumVoted || !votes[index] || votes[index] === 0) {
            percentage = 0;
        } else {
            percentage = (Math.round(votes[index] / sumVoted * 100 * 100)) / 100; 
        }
        return <li class="qustionnaire__pieChart">
            <span class='questionnaire__result-text'>{index + 1} : </span>
            <div class='pieChart__color' style={colorScheme}></div>
            <span>{text}</span>
            <span>({percentage.toFixed(2)} %)</span>
        </li>;
    });

    // 円グラフ設定
    const renderCustomizedLabel = ({
        cx, cy, midAngle, innerRadius, outerRadius, percent, index,
    }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
      return (
          <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {`${(percent * 100).toFixed(2)}%`}
          </text>
      );
    };


    return (
        <>
            <div class="questionnaire__pieList">
                <ul>
                    {questionnaireListData}
                </ul>
            </div>
            <PieChart>
                <Pie
                  data={pieData}
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={180}
                  fill="#8884d8"
                  dataKey="value"
                  isAnimationActive={false}
                >
                    {
                      pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
                    }
                </Pie>
                <Tooltip />
            </PieChart>
        </>
    );
}
