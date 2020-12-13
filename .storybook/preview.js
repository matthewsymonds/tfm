import React from 'react';
import {GlobalStyles} from 'pages/_app';
import {AppContext, appContext} from 'context/app-context';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import {reducer} from '../reducer';
import {getInitialState} from 'initial-state';

export const parameters = {
    actions: {argTypesRegex: '^on[A-Z].*'},
};

const withGlobalStyles = (Story, context) => {
    return (
        <React.Fragment>
            <GlobalStyles />
            <Story {...context} />
        </React.Fragment>
    );
};

const withAppContext = (Story, context) => {
    return (
        <AppContext.Provider value={appContext}>
            <Story {...context} />
        </AppContext.Provider>
    );
};

const store = createStore(reducer, getInitialState(['testUser']));
const withReduxStore = (Story, context) => {
    return (
        <Provider store={store}>
            <Story {...context} />
        </Provider>
    );
};

export const decorators = [withGlobalStyles, withAppContext, withReduxStore];
