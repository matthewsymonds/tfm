import {Centered} from 'components/centered';
import {InputBox} from 'components/input-box';
import {Mars} from 'components/mars';
import {colors} from 'components/ui';
import {AppContext, appContext} from 'context/app-context';
import {FONTS} from 'fonts';
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
        /* font-family: 'SF UI Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica,
            Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; */
        font-family: 'Open Sans', 'Roboto', sans-serif;
        background: ${colors.MAIN_BG};
        overscroll-behavior: none;
    }
    ${FONTS}
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
    .active-round-outer {
        flex-direction: row;
        justify-content: center;
        padding-bottom: 100px;

        @media (max-width: 1366px) {
          flex-direction: column-reverse;
          justify-content: flex-end;
          align-items: center;
        }
    }
    .active-round-right {
        padding-right: 8px;
        @media (max-width: 1366px) {
            width: 100%;
            padding-top: 16px;
            padding-right: 0px;
            margin-left: auto;
            margin-right: auto;
            overflow-x: auto;
        }
    }
    .player-details {
        flex-direction: row;
        width: 100%;
        @media (max-width: 1366px) {
            flex-direction: column;
            align-items: center;
            margin-right: 0px;
            flex-shrink: 0;

            .player-boards-outer {
                width: 100%
            }
        }
    }
    .player-cards-and-tags {
        align-self: flex-start;
        @media (max-width: 1366px) {
            align-self: center;
        }
    }
    .board-wrapper {
        @media (max-width: 1366px) {
            width: fit-content;
            margin-left: auto;
            margin-right: auto;
            padding-left: 8px;
        }
    }
    .player-boards {
        flex-direction: column;
        justify-content: center;
        @media (max-width: 1366px) {
            flex-direction: row;
            margin-left: auto;
            margin-right: auto;
        }
    }
    .ellipsis {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .textLight1 {
        color: ${colors.TEXT_LIGHT_1};
    }
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
    state = {ready: false};
    componentDidMount() {
        this.setState({ready: true});
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
                    <div
                        className={className}
                        style={{visibility: this.state.ready ? 'visible' : 'hidden'}}
                        id={'root'}
                        suppressHydrationWarning
                    >
                        <GlobalStyles />
                        {typeof window === 'undefined' ? null : (
                            <InnerAppComponent {...this.props} />
                        )}
                    </div>
                </AppContext.Provider>
            </Provider>
        );
    }
}

export default withRedux(makeStore)(MyApp);
