import {createContext} from 'react';
import {GameState, PlayerState} from 'reducer';

let loggedInPlayerIndex = -1;

export function getLoggedInPlayer(state: GameState): PlayerState {
    return state.players[loggedInPlayerIndex];
}

function setLoggedInPlayerIndex(index: number) {
    loggedInPlayerIndex = index;
}

export const appContext = {
    setLoggedInPlayerIndex,
    getLoggedInPlayer,
};

export const AppContext = createContext(appContext);
