import React from 'react';
import html2canvas from 'html2canvas';
import downloadImg from '../img/download.png';

export default function DownloadButton(props) {

    const { subWindow } = props;

    const screenShot = () => {
        
        // 一旦アンケート結果画面以外を消す(スクショ範囲考えるのめんどくさいので)
        const otherElement = subWindow.document.getElementById("other_than_result_window");
        otherElement.style.setProperty('display', 'none');

        const resutWindowWidth = subWindow.document.getElementById("result_window").clientWidth;
        const resutWindowHeight = subWindow.document.getElementById("questionnaire__result").clientHeight + 50;
        html2canvas(subWindow.document.body, {
            width: resutWindowWidth,
            height: resutWindowHeight
        })
        .then((canvas) => {
            subWindow.document.getElementById("download").setAttribute("href", canvas.toDataURL("image/png"));
            subWindow.document.getElementById("download").click();
            // 要素を戻す
            otherElement.style.setProperty('display', 'block');
        })
    }

    return (
        <>
        <div
            class="btn btn__screenshot"
            onClick={screenShot}
        >
            スクリーンショット保存 
            <img src={downloadImg} id="screenShot"/>        
        </div>
        <a href="" id="download" download="アンケート結果.png" />
        </>
    );
}