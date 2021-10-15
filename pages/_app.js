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
        /* font-family: 'SF UI Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica,
            Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; */
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
    div[aria-hidden="true"] {
        position: absolute;
        left: 0;
        top: 0;
        transform: translate(-100%, -100%);
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
        max-width: 895px;
        display: grid;
        align-items: center;
        min-width: min(450px, 100%);
        grid-template-columns: 2fr 11fr 2fr;
        grid-template-areas:
          "global-params board milestones-awards-board-switcher-wrapper"
          "player-boards-outer player-boards-outer player-boards-outer"
          "empty-space-left player-cards-and-tags-outer empty-space-right";
        @media (max-width: 895px) {
            grid-template-areas:
              "board board board"
              "global-params global-params global-params"
              "milestones-awards-board-switcher-wrapper milestones-awards-board-switcher-wrapper milestones-awards-board-switcher-wrapper"
              "player-boards-outer player-boards-outer player-boards-outer"
              "player-cards-and-tags-outer player-cards-and-tags-outer player-cards-and-tags-outer";
        }
        padding-bottom: 100px;
        box-sizing: border-box;
    }
    .global-params {
        grid-area: global-params;
    }
    .board {
        grid-area: board;
    }
    .milestones-awards-board-switcher-wrapper {
        grid-area: milestones-awards-board-switcher-wrapper;
    }
    .player-boards-outer {
        width: 100%;
        grid-area: player-boards-outer;

    }
    .player-cards-and-tags-outer {
        width: 100%;
        box-sizing: border-box;
        @media (max-width: 895px) {
            padding-left: 8px;
            padding-right: 8px;
        }
        grid-area: player-cards-and-tags-outer;
    }
    .player-cards-and-tags {
        align-self: flex-start;
        @media (max-width: 895px) {
            align-self: center;
        }
    }
    .board-wrapper {
        width: calc(100% - 16px);
        padding-left: 8px;
        padding-right: 8px;
    }
    .player-boards {
        justify-content: center;
        padding-left: 16px;
        flex-direction: row;
        margin-left: auto;
        margin-right: auto;
    }
    .ellipsis {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .textLight1 {
        color: ${colors.TEXT_LIGHT_1};
    }
    .truncate {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .inner-space-tag {
        transform: rotate(22.5deg) scale(1.5);
     }
     .inner-event {
        transform: rotate(90deg);

        div.not-mac button & {
            transform: translateX(-6px) rotate(90deg);
        }
    }

    .inner-emoji.earth {
        transform: scale(2.1);
    }

    .inner-emoji.jovian {
        transform: rotate(45deg) scale(2.75);
        .mac & {
            transform: rotate(-45deg) scale(2.75);
        }
    }

    .inner-space-tag {
        margin-right: 1px;
    }

    .mac { 
        .lightning {
            margin-right: 3px;
        }

        .titanium-icon {
            margin-left: 1px;
            margin-top: 1px;
        }
        
        .card-icon {
            margin-right: 1px;
        }

        .inner-event {
            margin-left: 6px;
        }

        .inner-space-tag {
            margin-left: 3px;
            margin-bottom: 3px;
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
