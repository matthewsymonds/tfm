import {createStore} from 'redux';
import {reducer} from './reducer';

export const makeStore = () => {
    return createStore(reducer);
};
