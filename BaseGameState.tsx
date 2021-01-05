import {BaseCommonState} from 'BaseCommonState';
import {BasePlayerState} from './BasePlayerState';
import {GameOptions} from './reducer';

export type BaseGameState = {
    // if true, the user is waiting for a response from the server.
    syncing?: boolean;
    options: GameOptions;
    common: BaseCommonState;
    players: Array<BasePlayerState>;
    log: string[];
    pendingVariableAmount?: number;
};
