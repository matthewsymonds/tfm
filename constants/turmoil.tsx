import {shuffle} from 'initial-state';
import {PlayerState} from 'reducer';
import {GLOBAL_EVENTS} from './global-events';
import {GREENS, KELVINISTS, MARS_FIRST, REDS, SCIENTISTS, UNITY} from './party';

export enum RequiredChairman {
    YOU = 'requiredChairmanYou',
    NEUTRAL = 'requiredChairmanNeutral',
}

export interface SerializedGlobalEvent {
    name: string;
}

export type Delegations = {
    [party: string]: Delegate[];
};

export type Delegate = {playerIndex?: number};

// A bit redundant but easiest way to track how many delegates a player has
// and move them from the reserve to a party if needed.
export type DelegateReserve = {
    [playerIndex: number]: Delegate[];
};

const NUM_PLAYER_DELEGATES = 7;

export interface Turmoil {
    globalEvents: SerializedGlobalEvent[];
    distantGlobalEvent: SerializedGlobalEvent;
    comingGlobalEvent: SerializedGlobalEvent;
    currentGlobalEvent?: SerializedGlobalEvent;
    rulingParty: string;
    dominantParty: string;
    delegations: Delegations;
    chairperson: Delegate;
    lobby: Delegate[];
    delegateReserve: DelegateReserve;
}

export function initializeTurmoil(players: PlayerState[]): Turmoil {
    const globalEvents = [...GLOBAL_EVENTS];
    shuffle(globalEvents);
    const [first, second, ...rest] = globalEvents;

    const delegations: Delegations = {
        [MARS_FIRST]: [],
        [SCIENTISTS]: [],
        [UNITY]: [],
        [GREENS]: [],
        [REDS]: [],
        [KELVINISTS]: [],
    };

    delegations[first.top.party].push(delegate());
    delegations[second.top.party].push(delegate());

    const delegateReserve: DelegateReserve = {};
    for (const player of players) {
        delegateReserve[player.index] = Array.from(Array(NUM_PLAYER_DELEGATES - 1)).map(() =>
            delegate(player.index)
        );
    }

    return {
        globalEvents: rest.map(event => ({name: event.top.name})),
        distantGlobalEvent: {name: second.top.name},
        comingGlobalEvent: {name: first.top.name},
        currentGlobalEvent: undefined,
        rulingParty: GREENS,
        dominantParty: first.top.party,
        delegations: delegations,
        chairperson: delegate(),
        lobby: players.map(player => delegate(player.index)),
        delegateReserve,
    };
}

function delegate(playerIndex?: number) {
    if (playerIndex === undefined) {
        return {};
    }
    return {playerIndex};
}
