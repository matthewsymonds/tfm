import {Box} from 'components/box';
import {MarsHeader} from 'components/mars-header';
import {colors} from 'components/ui';
import {AppContext, appContext} from 'context/app-context';
import {Fonts} from 'fonts';
import withRedux from 'next-redux-wrapper';
import App from 'next/app';
import Head from 'next/head';
import {useRouter} from 'next/router';
import {useEffect, useState} from 'react';
import {Provider} from 'react-redux';
import 'react-toastify/dist/ReactToastify.css';
import {makeStore} from 'store';
import {createGlobalStyle} from 'styled-components';

export const GlobalStyles = createGlobalStyle`
    body {
        margin: 0;
        font-family: 'Open Sans', 'Roboto', sans-serif;
        background: ${colors.MAIN_BG};
        overscroll-behavior: none;
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
    .active-round-outer {
        max-width: 929px;
        display: grid;
        align-items: flex-start;
        min-width: min(450px, 100%);
        grid-template-columns: 2fr 11fr 2fr;
        grid-template-areas: 
            "global-params board board-switcher-wrapper"
            "action-table action-table action-table";
        @media (max-width: 895px) {
            grid-template-areas:
              "board board board"
              "global-params global-params global-params"
              "board-switcher-wrapper board-switcher-wrapper board-switcher-wrapper"
              "action-table action-table action-table";
        }
        box-sizing: border-box;
    }
    .global-params {
        grid-area: global-params;
    }
    .board {
        grid-area: board;
    }
    .board-switcher-wrapper {
        grid-area: board-switcher-wrapper;
    }
    .action-table {
        grid-area: action-table;

        width: 500px;
        @media (max-width: 895px) {
            width: calc(100% - 16px);
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
        &.mac {
            transform: rotate(-45deg);
        }
    }

    .mid-city.emoji {
        font-size: 2.75em;
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

    .mid-emoji.jovian {
        font-size: 3.3em;
    }
    .mid-science {
        font-family: "Source Sans Pro", Segoe UI Symbol;
        font-size: 2em;
    }

    .mac {
        .mid-science {
        }
        .energy-icon {
            margin-right: 5%;
        }

        .heat-icon {
            margin-right: 2px;
            margin-bottom: 1px;
        }
        
        .card-icon {
            margin-right: 1px;
        }
    }
`;

function InnerAppComponent({Component, pageProps, session}) {
    const router = useRouter();
    const [path, setPath] = useState(router.pathname ?? '');
    useEffect(() => {
        setPath(router.pathname);
        if (typeof history !== 'undefined') {
            history.scrollRestoration = 'manual';
        }
    }, [router.pathname]);
    if (router.pathname.includes('games')) {
        return <Component {...pageProps} session={session} />;
    }
    return (
        <>
            <MarsHeader />
            <Component {...pageProps} session={session} />
        </>
    );
}

export const PROTOCOL_HOST_DELIMITER = '://';

const FONT_LIST = ['Open Sans', 'Ubuntu Condensed'];
const FONT_WEIGHT_LIST = [400, 500, 600, 700, 900];

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
        let className = 'not-mac';
        if (
            typeof window !== 'undefined' &&
            navigator.userAgent.toUpperCase().indexOf('MAC') >= 0
        ) {
            className = 'mac';
        }
        return (
            <Provider store={store}>
                <Head>
                    <title>TFM Online</title>
                </Head>

                <AppContext.Provider value={appContext}>
                    <div
                        style={{visibility: this.state.ready ? 'visible' : 'hidden'}}
                        id={'root'}
                        suppressHydrationWarning
                    >
                        <Fonts />
                        <GlobalStyles />
                        {/* Force every font to load */}
                        {FONT_LIST.flatMap(font =>
                            FONT_WEIGHT_LIST.map(weight => (
                                <Box
                                    fontFamily={font}
                                    fontWeight={weight}
                                    visibility="hidden"
                                    key={font + '-' + weight}
                                    position="absolute"
                                    transform="translate(-100%, -100%)"
                                >
                                    Hidden
                                </Box>
                            ))
                        )}
                        {typeof window === 'undefined' ? null : (
                            <div className={className}>
                                <InnerAppComponent {...this.props} />
                            </div>
                        )}
                    </div>
                </AppContext.Provider>
            </Provider>
        );
    }
}

export default withRedux(makeStore)(MyApp);
