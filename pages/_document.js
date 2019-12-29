import Document, {Head, Main, NextScript} from 'next/document';
import {ServerStyleSheet, createGlobalStyle} from 'styled-components';

const GlobalStyles = createGlobalStyle`
    body {
        margin: 20px;
        background: #fefefe;
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
