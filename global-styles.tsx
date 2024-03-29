import {colors} from 'components/ui';
import {createGlobalStyle} from 'styled-components';

export const GlobalStyles = createGlobalStyle`
    body {
        margin: 0;
        font-family: 'Open Sans', 'Roboto', sans-serif;
        background: ${colors.MAIN_BG};
        overscroll-behavior: none;
    }
    img.emoji {
        height: 1em;
        width: 1em;
        margin: 0;
        vertical-align: -0.15em;
     }
    iframe {
        border: 0;
        padding: 0;
        margin: 0;
        width: unset;
        height: unset;
        body {
            margin: 0;
        }
    }
    html, body {
        height: 100%;
    }
    #__next, #root, #__next > div {
        height: 100%;
        min-height: 100%;
    }
    #__next > div {
      display: flex;
      flex-direction: column;
    }

    * {
      -webkit-tap-highlight-color: rgba(255, 255, 255, 0) !important;
      -webkit-focus-ring-color: rgba(255, 255, 255, 0) !important;
      outline: none !important;
    }
    body::-webkit-scrollbar-track {
        background: rgba(0,0,0,0);
      }
    h1, h2, h3, h4 {
      margin-top: 16px;
      margin-bottom: 16px;
      display: inherit;
    }
    h3 {
      text-align: left;
      margin-top: 0px;
    }
    h4 {
      font-weight: normal;
    }
    hr {
      box-shadow: none;
      border: 0;
      height: 2px;
      background: #cecece;
      margin: 0;
    }
    table {
        border-radius: 4px;
        max-width: inherit;
        border-collapse: collapse;
    }
    th {
        text-align: left;
        padding-left: 4px;
        padding-right: 4px;
    }
    tr:first-child {
        border-bottom: 1px solid ${colors.DARK_2};
    }
    tr:last-child {
        border-top: 1px solid ${colors.DARK_2};
        td {
            padding: 4px;
        }
    }
    td {
        text-align: right;
        padding-left: 4px;
        padding-right: 4px;
    }
    .display {
        font-family: 'Ubuntu Condensed', sans-serif;
    }
    .display-reset {
        font-family: 'Open Sans', 'Roboto', sans-serif;
    }
    .active-round {
        display: flex;
        flex-direction: column;
        max-width: 798px;
    }
    .player-board {
        margin-left: 8px;
        margin-right: 8px;
        margin-top: 10px;
        &.first {
            margin-left: 0px;
            @media (max-width: 1500px) {
                margin-left: 8px;
            }
        }
        &.last {
            margin-right: 0;
            @media (max-width: 1500px) {
                margin-right: 8px;
            }
        }
    }
    .turmoil {
        @media (max-width: 1500px) {
            margin: 4px auto;
        }
    }
    .policy-table {
        display: table;
        @media (max-width: 420px) {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
        }
    }
    .prompt-box {
        max-width: fit-content;
        padding-left: 8px;
        padding-right: 8px;
        margin-bottom: 8px;
        @media (max-width: 1500px) {
            margin-left: auto;
            margin-right: auto;
        }
    }
    .top-wrapper {
        @media (max-width: 1500px) {
            width: 798px;
            max-width: calc(100% - 8px);
        }
    }
    .active-round-outer {
        display: flex;
        width: 100%;
        box-sizing: border-box;
        @media (max-width: 1500px) {
            flex-direction: column;
        }
    }
    .colonies {
        @media (max-width: 1500px) {
            justify-content: center;
        }
    }
    .board-and-params {
        width: 678px;
        max-width: calc(100% - 8px);
        margin-bottom: 8px;
        @media (max-width: 1500px) {
            justify-content: center;
            flex-grow: 0;
            margin-left: auto;
            margin-right: auto;
        }
        @media (max-width: 895px) {
            flex-direction: column;
            align-items: center;
        }
    }
    #hide-beneath-1500 {
        @media (max-width: 1500px) {
            display: none;
        }
    }
    .action-table {
        width: 798px;
        max-width: calc(100% - 8px);
        @media (max-width: 1500px) {
            width: 100%;
            flex-grow: 0;
            margin-left: auto;
            margin-right: auto;
        }
    }
    .action-table-buttons {
        margin-bottom: 4px;
        margin-top: 8px;
        @media (max-width: 1500px) {
            justify-content: center;
        }
        @media (max-width: 420px) {
            justify-content: flex-start;
        }
    }
    .action-table-actions {
        @media (max-width: 1500px) {
            margin-left: auto;
            margin-right: auto;
        }
    }
    .board {
        width: 100%;
        flex-grow: 1;
    }
    .round-text {
        justify-content: flex-end;
        @media (max-width: 895px) {
            justify-content: flex-start;
            margin-left: 4px;
            margin-top: 4px;
        }
    }
    .toast {
        background: hsl(18deg 74% 88%);
        color: #111111;
        border-radius: 8px;
        border-width: 2px;
        border-style: solid;
        border-color: ${colors.CARD_BORDER_1};
        border-left-color: ${colors.CARD_BORDER_1};
        border-bottom-color: ${colors.CARD_BORDER_2};
        border-right-color: ${colors.CARD_BORDER_2};
    }
    .ellipsis {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .inline {
        display: inline;
    }
    .overflow-auto {
        overflow: auto;
    }
    .width-full {
        width: 100%;
    }
    .height-full {
        height: 100%;
    }
    .textLight1 {
        color: ${colors.TEXT_LIGHT_1};
    }
    .mid-event {
        font-size: 1.5em;
        .android & {
            transform: scaleX(300%) scaleY(170%) translateY(-2.5%);
            transform-origin: 50% 60%;
        }
    }

    .mid-city.emoji {
        font-size: 2em;
    }

    .outer-space-tag {
        transform: rotate(22.5deg);
    }

    .mid-space-tag {
        font-size: 1.5em;
    }

    .mid-emoji.earth {
        font-size: 2.04em;
    }

     .inner-building {
        background-color: #43362e;
        clip-path: polygon(0 48%, 50% 0, 100% 48%, 100% 100%, 0 100%);
        width: 72%;
        height: 48%;
        position: relative;
        transform: translateY(-15%);
    }

    img.delegate {
        margin: 0;
    }

    .mid-science {
        font-family: "Source Sans Pro", Segoe UI Symbol;
        font-size: 2em;
    }
`;
