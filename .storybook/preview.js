import React, {useContext} from 'react';
import {GlobalStyles} from 'pages/_app';
import {AppContext, appContext} from 'context/app-context';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import {reducer} from '../reducer';
import {getMockState} from 'utils/getMockState';
import {Deck} from 'constants/card-types';

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
            {(() => {
                const context = useContext(AppContext);
                context.setUsername('Player 1');
                return <Story {...context} />;
            })()}
        </AppContext.Provider>
    );
};

const store = createStore(reducer, getMockState({decks: [Deck.BASIC, Deck.VENUS, Deck.PRELUDE]}));
const withReduxStore = (Story, context) => {
    return (
        <Provider store={store}>
            <Story {...context} />
        </Provider>
    );
};

const withGoogleFonts = (Story, context) => {
    return (
        <React.Fragment>
            <Story {...context} />
        </React.Fragment>
    );
};

export const decorators = [withGlobalStyles, withAppContext, withReduxStore, withGoogleFonts];
