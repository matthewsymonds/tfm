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
    .display {
        font-family: 'Ubuntu Condensed', sans-serif;
    }
    .active-round {
        display: flex;
        flex-direction: column;
        max-width: calc(100% - 16px);
    }
    .active-round-outer {
        display: flex;
        width: 100%;
        max-width: 1500px;
        margin-left: auto;
        margin-right: auto;
        flex-wrap: wrap;
        justify-content: center;
        box-sizing: border-box;
    }
    .colonies {
        @media (max-width: 1470px) {
            justify-content: center;
        }
    }
    .board-and-params {
        justify-content: flex-end;
        flex-grow: 1;
        @media (max-width: 1470px) {
            max-width: 100%;
            justify-content: center;
            flex-grow: 0;
            width: 100%;
        }
        @media (max-width: 895px) {
            flex-direction: column;
            align-items: center;
        }
    }
    .no-margin-top {
        margin-top: 0;
    }
    .action-table {
        flex-grow: 1;
        @media (max-width: 1470px) {
            width: 100%;
            flex-grow: 0;
            margin-left: auto;
            margin-right: auto;
        }
    }
    .action-table-buttons {
        @media (max-width: 1470px) {
            justify-content: center;
        }
    }
    .action-table-actions {
        @media (max-width: 1470px) {
            margin-left: auto;
            margin-right: auto;
        }
    }
    .board {
        max-width: calc(100vmin - 226px);
        width: 100%;
        @media (max-width: 895px) {
            max-width: 792px;
            width: calc(100% - 8px);
        }
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
    .board-wrapper {
        width: calc(100% - 16px);
        padding-left: 8px;
        padding-right: 8px;
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
    .truncate {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .mid-event {
        font-size: 1.5em;
        .android & {
            transform: scaleX(300%) scaleY(170%) translateY(-2.5%);
            transform-origin: 50% 60%;
        }
    }

    .outer-emoji.jovian {
        transform: rotate(45deg);
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

    .mid-emoji.jovian {
        font-size: 3.6em;
    }
    .mid-science {
        font-family: "Source Sans Pro", Segoe UI Symbol;
        font-size: 2em;
    }
`;
