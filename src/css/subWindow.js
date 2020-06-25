export const subWindowCss = `
    @import url(https://fonts.googleapis.com/css?family=M+PLUS+Rounded+1c);
    body {
        font-family: "M PLUS Rounded 1c";
        background-color: lime;
    }
    .questionnaire__result {
        text-align: left;
        margin-top: 20px;
        width : 80%;
    }
    .questionnaire__result-window {
        text-align: center;
        width: 100%;
        min-height: 300px;
        padding: 10px;
    }
    .questionnaire__result-item {
        display: inline-block;
        border-radius: 8px;
        border: 3.5px solid #cacaca;
        width: 350px;
        vertical-align: top;
        padding: 25px;
        overflow-wrap: break-word;
        color: #fff;
        background: #97b6f0;
        margin: 10px 15px;
        text-align: center;
        text-shadow: .5px .5x 0 #444,-.5px .5px 0 #444,.5px -.5px 0 #444,-.5px -.5px 0 #444;
    }
    .questionnaire__result-title {
        font-size: 1.75em;
        width: 100%;
        padding: 30px;
        color: #fff;
        text-align: center;
        background: #444;
    }
    .questionnaire__result-text {
        font-size: 1.8em;
    }
    .questionnaire__result-percentage {
        color: #fff;
        font-weight: bold;
        text-stroke: 1px #000;
        -webkit-text-stroke: 1px #ffe000;
        font-size: 1.75em;
    }
    .questionnaire__result-deleteButton {
        border-radius: 40px;
        border: 1px solid #fff;
        padding: 1.4px;
        width: 25px;
        cursor: pointer;
    }
    .questionnaire__result-deleteButton:hover {
        background: #c9171e;
        color:#fff;
    }
    .btn {
        color: #fff;
        width: 70%;
        padding: 2px;
        font-size: .8em;
        text-align: center;
        margin: 0 auto;
        border-radius: 2px;
        cursor: pointer;
    }
    .btn__wrap {
        text-align: center;
    }
    .btn__startInactive,.btn__historyInactive {
        cursor: auto;
        background: #747474;
    }
    .btn__startInactive,.btn__startQuestionnaire {
        font-size: 1.75em;
        display: inline-block;
        text-align: center;
        padding: 10px;
        width: 350px;
        margin-top: 15px;
    }
    .btn__startQuestionnaire {
        margin-left: 15px;
        background: #c9171e;
    }
    .btn__startQuestionnaire:hover {
        background: #a11218;
    }
    .btn__finishQuestionnaire {
        display: inline-block;
        font-size: 1.75em;
        width: 350px;
        margin-top: 15px;
        text-align: center;
        background: #4a49ad;
        padding: 10px;
    }
    .btn__finishQuestionnaire:hover {
        background: #3b3a8a;
    }
    .btn__retryQuestionnaire {
        display: inline-block;
        font-size: 1.75em;

        width: 450px;
        margin-top: 15px;
        margin-left: 40px;
        text-align: center;
        background: #db4b94;
        padding: 10px;
    }
    .btn__retryQuestionnaire:hover {
        background: #94285f;
    }

    .btn__historyInactive,.btn__saveHistory {
        font-size: 1.2em;

        width: 300px;
        margin-top: 15px;
        text-align: center;
        padding: 10px;
    }

    .btn__saveHistory {
        background: #2ab4de;
    }

    .btn__saveHistory:hover {
        background: #1d70ab;
    }

    .btn__addQuestionnaire {
        display: inline-block;
        width: 100px;
        margin-left: 15px;
        background: #00b39a;
    }
    .btn__addQuestionnaire:hover {
        background: #008f7b;
    }
    .btn__aggregate {
        cursor: auto;
        width: 280px;
        font-size: 1.75em;
        display: inline-block;
        text-align: center;
        margin-top: 15px;
        margin-right: 15px;
        padding: 10px;
        margin-left: 15px;
        background: #747474;
    }
    .btn__detail {
        cursor: auto;
        padding: 10px;
        width: 500px;
        font-size: 1em;
        color: #444;
        background: #fff;
    }
    .btn__hide {
        display: none;
    }
    .btn__voteCount {
        color: white;
        background: #ff6104;
        cursor: auto;
        width: 280px;
        margin-right: 63%;
        font-size: 1.75em;
    }
    input[type=checkbox] {
        -ms-transform: scale(1.7);
        -webkit-transform: scale(1.7);
        transform: scale(1.7);
        margin: 15px 5px;
    }
    .checkbox-icon {
        padding: 13px;
    }
`;