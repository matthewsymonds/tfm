import Document, {Head, Main, NextScript} from 'next/document';
import {ServerStyleSheet, createGlobalStyle} from 'styled-components';

const GlobalStyles = createGlobalStyle`
    body {
        background: #fefefe;
    }
    div.mac {
      span.icon {
        position: relative;
        left: 2px;
      }
    }
    * {
      -webkit-tap-highlight-color: rgba(255, 255, 255, 0) !important;
      -webkit-focus-ring-color: rgba(255, 255, 255, 0) !important;
      outline: none !important;
    }
    h1, h2, h3, h4 {
      text-align: center;
      margin-top: 16px;
      margin-bottom: 16px;
      display: inherit;
    }
    h4 {
      font-weight: normal;
    }
    button {
      display: block;
      cursor: pointer;
      border-radius: 4px;
      margin-top: auto;
      :not(:last-child) {
          margin-top: 16px;
          margin-bottom: 16px;
      }
      margin-left: auto;
      margin-right: auto;
      justify-self: flex-end;
      border-radius: 5px;
      border: 2px solid white;
      &:hover {
        background: #bcbcbc;
        border: 2px solid #fefefe;
      }
      &:disabled {
        cursor: auto;
        background: #dedede;
        box-shadow: none;
      }
      padding: 12px;
      min-width: 100px;
      font-size: 14px;
      background: #cdcdcd;
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
                <Head>{this.props.styleTags}
                  <meta charset="UTF-8" />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </html>
        );
    }
}
