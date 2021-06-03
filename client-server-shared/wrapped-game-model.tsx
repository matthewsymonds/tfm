import {GameState} from 'reducer';
import {AnyAction} from 'redux';

export interface WrappedGameModel {
    state: GameState;
    queue: Array<AnyAction>;
    players: Array<string>;
    name: string;
}
