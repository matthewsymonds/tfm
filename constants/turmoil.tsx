import {shuffle} from 'initial-state';
import {PlayerState} from 'reducer';
import {GlobalEvent, GLOBAL_EVENTS} from './global-events';
import {
    GREENS,
    KELVINISTS,
    MARS_FIRST,
    REDS,
    SCIENTISTS,
    TurmoilParty,
    UNITY,
} from './party';

export enum RequiredChairman {
    YOU = 'requiredChairmanYou',
    NEUTRAL = 'requiredChairmanNeutral',
}

export interface SerializedGlobalEvent {
    name: string;
}

export type Delegations = {
    [party in TurmoilParty]: Delegate[];
};

export type Delegate = {playerIndex?: number};

// A bit redundant but easiest way to track how many delegates a player has
// and move them from the reserve to a party if needed.
export type DelegateReserve = {
    [playerIndex: number]: Delegate[];
};

const NUM_PLAYER_DELEGATES = 7;
export const LOBBYING_COST = 5;

export interface Turmoil {
    globalEvents: SerializedGlobalEvent[];
    oldGlobalEvents: SerializedGlobalEvent[];
    distantGlobalEvent: SerializedGlobalEvent;
    comingGlobalEvent: SerializedGlobalEvent;
    currentGlobalEvent?: SerializedGlobalEvent;
    rulingParty: TurmoilParty;
    dominantParty: TurmoilParty;
    delegations: Delegations;
    chairperson: Delegate;
    lobby: Delegate[];
    delegateReserve: DelegateReserve;
}

function DEV_globalEventOverrides(events: GlobalEvent[]) {
    const globalEventOverrides: Array<string> = ([] as Array<string>).map(a =>
        a.toLowerCase()
    );
    const priorityEvents = events.filter(globalEvent => {
        return (
            globalEventOverrides.includes(globalEvent.top.name.toLowerCase()) ||
            globalEventOverrides.includes(globalEvent.bottom.name.toLowerCase())
        );
    });

    const otherEvents = events.filter(globalEvent => {
        return !priorityEvents.includes(globalEvent);
    });

    return priorityEvents.concat(otherEvents);
}

export function initializeTurmoil(players: PlayerState[]): Turmoil {
    let globalEvents = [...GLOBAL_EVENTS];
    shuffle(globalEvents);
    globalEvents = DEV_globalEventOverrides(globalEvents);
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
        delegateReserve[player.index] = Array.from(
            Array(NUM_PLAYER_DELEGATES - 1)
        ).map(() => delegate(player.index));
    }

    return {
        globalEvents: rest.map(event => ({name: event.top.name})),
        oldGlobalEvents: [],
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

export function delegate(playerIndex?: number) {
    return {playerIndex};
}
