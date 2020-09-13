import {applyMiddleware, createStore} from 'redux';
import thunk from 'redux-thunk';
import {reducer} from './reducer';

export const makeStore = (initialState, options) => {
    return createStore(reducer, initialState, applyMiddleware(thunk));
};
