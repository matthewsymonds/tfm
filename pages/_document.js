import Document, {Head, Main, NextScript} from 'next/document';
import {createGlobalStyle, ServerStyleSheet} from 'styled-components';

const GlobalStyles = createGlobalStyle`
    body {
        background: #f5f5f5;
    }
    html, body, #__next, #__next > div {
      min-height: 100vh;
    }
    #__next > div {
      display: flex;
      flex-direction: column;
    }
    div.mac {
      span.tag-icon {
        position: relative;
        left: 3px;
        bottom: 0.5px;
      }
      span.resource-icon {
        position: relative;
        left: 2.5px;
        bottom: 0.5px;
      }
      span.titanium-icon {
        position: relative;
        bottom: 0.5px;
      }
      span.megacredit-icon {
        position: relative;
        left: 1px;
        bottom: 0.5px;
      }
      span.jovian-icon {
        position: relative;
        left: 0.5px;
        bottom: 0.5px;
      }
      span.building-icon {
        position: relative;
        left: 2.75px;
        bottom: 0.5px;
      }
      span.space-icon {
        position: relative;
        left: 3px;
        bottom: 0.5px;
      }
    }
    * {
      -webkit-tap-highlight-color: rgba(255, 255, 255, 0) !important;
      -webkit-focus-ring-color: rgba(255, 255, 255, 0) !important;
      outline: none !important;
    }
    h1, h2, h3, h4 {
      text-align: center;
      align-self: center;
      margin-top: 16px;
      margin-bottom: 16px;
      display: inherit;
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
    .active-round-outer {
      .right-box {
        margin-left: 16px;
      }
        @media (max-width: 1210px) {
          flex-direction: column-reverse;
          align-items: center;
          .right-box {
            margin-left: 0px;
          }
      }
    }
    button {
      display: flex;
      align-items: center;
      justify-content: space-around;
      cursor: pointer;
      border-radius: 4px;
      margin-top: auto;
      line-height: 8px;
      :not(:last-child) {
          margin-top: 16px;
          margin-bottom: 16px;
      }
      margin-left: auto;
      margin-right: auto;
      justify-self: flex-end;
      border-radius: 5px;
      border: 2px solid white;
      &:disabled, &:hover:disabled {
        border: 2px solid #dedede;
      }
      color: #111;

      &:hover {
        border: 2px solid #fefefe;
        background: #ccc;
        color: #222;
      }
      &:disabled {
        cursor: auto;
        color: auto;
        background: #dedede;
        box-shadow: none;
      }
      padding: 12px;
      min-width: 100px;
      font-size: 14px;
    }
`;

export default class MyDocument extends Document {
    static getInitialProps({renderPage}) {
        const sheet = new ServerStyleSheet();
        const page = renderPage(App => props =>
            sheet.collectStyles(
                <>
                    <GlobalStyles />
                    <App {...props} />
                </>
            )
        );
        const styleTags = sheet.getStyleElement();
        return {...page, styleTags};
    }

    render() {
        return (
            <html>
                <Head>{this.props.styleTags}</Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </html>
        );
    }
}
