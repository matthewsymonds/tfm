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
