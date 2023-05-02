import React, {useContext, useState} from 'react';
import {AppContext, appContext} from '../context/app-context';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import {reducer} from '../reducer';
import {getMockState} from '../utils/getMockState';
import {Deck} from '../constants/card-types';
import {Fonts} from '../fonts';
import {Preview} from '@storybook/react';
import '../globals.css';

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

const store = createStore(
    reducer,
    getMockState({
        isDraftingEnabled: true,
        decks: [Deck.BASIC, Deck.VENUS, Deck.PRELUDE],
        boardNames: ['Tharsis', 'Hellas', 'Elysium'],
    })
);
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
            <Fonts />
            <Story {...context} />
        </React.Fragment>
    );
};

const preview: Preview = {
    parameters: {
        actions: {argTypesRegex: '^on[A-Z].*'},
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/,
            },
        },
    },
    decorators: [withAppContext, withReduxStore, withGoogleFonts],
};

export default preview;
