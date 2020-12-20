import {Centered} from 'components/centered';
import {InputBox} from 'components/input-box';
import {Mars} from 'components/mars';
import {colors} from 'components/ui';
import {AppContext, appContext} from 'context/app-context';
import withRedux from 'next-redux-wrapper';
import App from 'next/app';
import Head from 'next/head';
import {useRouter} from 'next/router';
import platform from 'platform-detect';
import {useEffect, useState} from 'react';
import {Provider} from 'react-redux';
import {makeStore} from 'store';
import {createGlobalStyle} from 'styled-components';

export const GlobalStyles = createGlobalStyle`
    body {
        margin: 0;
        font-family: 'SF UI Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica,
            Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
        background: ${colors.MAIN_BG};
        overscroll-behavior: none;
    }
    html, body, #__next, #__next > div {
      min-height: 100%;
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
          flex-direction: column;
          align-items: center;
          .right-box {
            margin-left: 0px;
          }
      }
    }
    /* button, input[type="submit"] {
      display: flex;
      align-items: center;
      justify-content: space-around;
      cursor: pointer;
      padding: 10px 20px;
      border-radius: 3px;
      line-height: 8px;
      justify-self: flex-end;
      border: 1px solid #757575;
      background-color: #eae9e9;
      color: #222222;
      font-size: 14px;

      &:hover:not([disabled]) {
        background: #cccccc;
      }
      &:disabled {
        cursor: auto;
        opacity: 0.6;
      }

      &:focus {
        background: #bbb;
      }
    } */
`;

function InnerAppComponent({Component, pageProps, session}) {
    const router = useRouter();
    const [path, setPath] = useState(router.pathname ?? '');
    useEffect(() => {
        setPath(router.pathname);
    }, [router.pathname]);
    if (path.includes('games')) {
        return <Component {...pageProps} session={session} />;
    }
    return (
        <>
            <Centered>
                <Mars />
                <InputBox>
                    <Component {...pageProps} session={session} />
                </InputBox>
            </Centered>
        </>
    );
}

export const PROTOCOL_HOST_DELIMITER = '://';

function getSessionPath(isServer, headers) {
    const path = '/api/sessions';
    if (!isServer) {
        return path;
    }

    const {host} = headers;
    const protocol = /^localhost(:\d+)?$/.test(host) ? 'http' : 'https';
    return protocol + PROTOCOL_HOST_DELIMITER + host + path;
}

class MyApp extends App {
    static async getInitialProps(params) {
        const {ctx} = params;
        const {isServer, req, res} = ctx;

        const headers = isServer ? req.headers : {};

        let session;
        try {
            const response = await fetch(getSessionPath(isServer, headers), {
                headers,
            });
            session = await response.json();
        } catch {
            session = {username: ''};
        }

        if (isServer) {
            // Handle server session redirect scenarios. Server-side only.
            // Client won't generate links you're not authorized to click!
            const hasSession = session?.username;
            const path = isServer ? req.url : window.location.pathname;
            const isLoginOrSignup = ['/login', '/signup', '/logout'].includes(path);

            // Two scenarios require redirect:
            // You're logged in, but you are visiting /login or /signup.
            // You're logged out, trying to access anything else.
            const shouldRedirect = hasSession === isLoginOrSignup;

            const location = hasSession ? '/' : '/login';
            // If they're not logged in, take them to the log in page.
            if (shouldRedirect) {
                res.writeHead(302, {
                    Location: location,
                });
                res.end();
            }
        }

        return {
            session,
            ...(await super.getInitialProps(params)),
        };
    }
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
