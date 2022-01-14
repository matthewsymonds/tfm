import {Box} from 'components/box';
import {appContext, AppContext as MyAppContext} from 'context/app-context';
import {Fonts} from 'fonts';
import {GlobalStyles} from 'global-styles';
import {AppProps} from 'next/app';
import Head from 'next/head';
import {Provider} from 'react-redux';
import 'react-toastify/dist/ReactToastify.css';
import {makeStore} from 'store';

function InnerAppComponent({Component, pageProps}) {
    return <Component {...pageProps} />;
}

export const PROTOCOL_HOST_DELIMITER = '://';

const FONT_LIST = ['Open Sans', 'Ubuntu Condensed'];
const FONT_WEIGHT_LIST = [400, 500, 600, 700, 900];

const store = makeStore();

const MyApp = ({Component, pageProps}: AppProps) => {
    return (
        <Provider store={store}>
            <Head>
                <title>TFM Online</title>
            </Head>

            <MyAppContext.Provider value={appContext}>
                <div id={'root'}>
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
                    <InnerAppComponent Component={Component} pageProps={pageProps} />
                </div>
            </MyAppContext.Provider>
        </Provider>
    );
};

MyApp.getInitialProps = async ({Component, ctx}) => {
    let pageProps = {};
    if (Component.getInitialProps) {
        pageProps = await Component.getInitialProps(ctx);
    }

    return {pageProps};
};

export default MyApp;
