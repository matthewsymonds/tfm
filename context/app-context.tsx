import {createContext} from 'react';
import {GameState, PlayerState} from 'reducer';

let username = '';
let lastSeenLogItem = 0;

export function getLoggedInPlayer(state: GameState): PlayerState {
    return state.players.find(player => player.username === username)!;
}

function setUsername(theUsername: string) {
    username = theUsername;
}

function getUsername(): string {
    return username;
}

function setLastSeenLogItem(index: number) {
    lastSeenLogItem = index;
}

function getLastSeenLogItem(): number {
    return lastSeenLogItem;
}

export const appContext = {
    setUsername,
    getLoggedInPlayer,
    getUsername,
    getLastSeenLogItem,
    setLastSeenLogItem,
};

export const AppContext = createContext(appContext);
