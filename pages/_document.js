import Document, {Head, Main, NextScript} from 'next/document';
import {ServerStyleSheet, createGlobalStyle} from 'styled-components';

const GlobalStyles = createGlobalStyle`
    body {
        background: #fefefe;
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
      background: #7d7d7d;
      margin: 0;
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
                <Head>{this.props.styleTags}</Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </html>
        );
    }
}
