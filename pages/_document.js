import Document, {Head, Main, NextScript} from 'next/document';
import {ServerStyleSheet, createGlobalStyle} from 'styled-components';

const GlobalStyles = createGlobalStyle`
    body {
        background: #fefefe;
    }
    * {
      -webkit-tap-highlight-color: rgba(255, 255, 255, 0) !important;
      -webkit-focus-ring-color: rgba(255, 255, 255, 0) !important;
      outline: none !important;
    }
    h1, h2, h3, h4 {
      text-align: center;
      margin-top: 0px;
      margin-bottom: 12px;
      display: inherit;
    }
    h4 {
      font-weight: normal;
    }
    button {
      display: block;
      cursor: pointer;
      &:disabled {
        cursor: auto;
      }
      margin-top: auto;
      margin-left: auto;
      margin-right: auto;
      justify-self: flex-end;
      border: 0;
      background: none;
      box-shadow: none;
      border-radius: 0px;
      padding: 12px;
      min-width: 100px;
      font-size: 14px;
      background: #dddddd;
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
