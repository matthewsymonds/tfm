import {Centered} from 'components/centered';
import {Header} from 'components/header';
import {InputBox} from 'components/input-box';
import {AppContext, appContext} from 'context/app-context';
import {defaultTheme} from 'evergreen-ui';
import withRedux from 'next-redux-wrapper';
import App from 'next/app';
import Head from 'next/head';
import {useRouter} from 'next/router';
import platform from 'platform-detect';
import {Provider} from 'react-redux';
import {makeStore} from 'store';
import {createGlobalStyle} from 'styled-components';
import {Mars} from 'components/mars';
import {colors} from 'components/ui';

const GlobalStyles = createGlobalStyle`
    body {
        margin: 0;
        font-family: 'SF UI Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica,
            Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
        background: ${colors.MAIN_BG};
    }
    html, body, #__next, #__next > div {
      min-height: 100vh;
    }
    #__next > div {
      display: flex;
      flex-direction: column;
    }
    .inverted {
      filter: invert(100%);
    }
    
    div.macBROKEN {
      span.tag-icon {
        position: relative;
        left: 2px;
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
    body::-webkit-scrollbar-track {
        background: rgba(0,0,0,0);
      }
    h1, h2, h3, h4 {
      text-align: center;
      align-self: center;
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
    input {
      padding: 6px;
      font-size: 16px;
    }
    button, input[type="submit"] {
      display: flex;
      align-items: center;
      justify-content: space-around;
      cursor: pointer;
      padding: 10px 20px;
      border-radius: 3px;
      line-height: 8px;
      justify-self: flex-end;
      border: 1px solid #757575;
      background-color: #eae9e9
      color: #222222;
      font-size: 14px;

      &:hover:not([disabled]) {
        background: #cccccc;
      }
      &:disabled {
        cursor: auto;
        opacity: 0.6;
      }
      &:active, &:focus {
          opacity: 0.8;
      }

      &:focus {
        background: #bbb;
      }
    }
`;

const customTheme = {
    ...defaultTheme,
    spinnerColor: 'hotpink',
};

function InnerAppComponent({Component, pageProps}) {
    const router = useRouter();
    if (router.pathname.includes('games')) {
        return <Component {...pageProps} />;
    }
    return (
        <>
            <Centered>
                <Mars />
                <InputBox>
                    <Component {...pageProps} />
                </InputBox>
            </Centered>
        </>
    );
}

class MyApp extends App {
    render() {
        const {store} = this.props;
        let className;
        if (platform.macos) {
            className = 'mac';
        }

        return (
            <Provider store={store}>
                <Head>
                    <title>TFM Online</title>
                </Head>
                <AppContext.Provider value={appContext}>
                    <div className={className}>
                        <GlobalStyles />
                        <InnerAppComponent {...this.props} />
                    </div>
                </AppContext.Provider>
            </Provider>
        );
    }
}

export default withRedux(makeStore)(MyApp);
