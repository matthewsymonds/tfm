import {Provider} from 'react-redux';
import App from 'next/app';
import withRedux from 'next-redux-wrapper';
import {makeStore} from '../store';
class MyApp extends App {
    static async getInitialProps({Component, ctx}) {
        // we can dispatch from here too
        ctx.store.dispatch({type: 'FOO', payload: 'foo2'});

        const pageProps = Component.getInitialProps ? await Component.getInitialProps(ctx) : {};

        return {pageProps};
    }

    render() {
        const {Component, pageProps, store} = this.props;
        return (
            <Provider store={store}>
                <Component {...pageProps} />
            </Provider>
        );
    }
}

export default withRedux(makeStore)(MyApp);
