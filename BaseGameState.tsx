import {BaseCommonState} from 'BaseCommonState';
import {BasePlayerState} from 'BasePlayerState';
import {GameAction} from 'GameActionState';

import {GameOptions} from 'reducer';

export type BaseGameState = {
    // if true, the user is waiting for a response from the server.
    syncing?: boolean;
    options: GameOptions;
    common: BaseCommonState;
    players: Array<BasePlayerState>;
    log: Array<GameAction>;
    pendingVariableAmount?: number;
    timestamp?: number;
    name: string;
    actionCount?: number;
    logLength?: number;
};
