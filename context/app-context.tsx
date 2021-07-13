import {createContext} from 'react';
import {GameState, PlayerState} from 'reducer';

let loggedInPlayerIndex = -1;

let lastSeenLogItem = 0;

export function getLoggedInPlayer(state: GameState): PlayerState {
    return state.players[loggedInPlayerIndex];
}

function setLoggedInPlayerIndex(index: number) {
    loggedInPlayerIndex = index;
}

export function getLastSeenLogItem(): number {
    return lastSeenLogItem;
}

function setLastSeenLogItem(item: number) {
    lastSeenLogItem = item;
}

export const appContext = {
    setLoggedInPlayerIndex,
    getLoggedInPlayer,
    setLastSeenLogItem,
    getLastSeenLogItem,
};

export const AppContext = createContext(appContext);
