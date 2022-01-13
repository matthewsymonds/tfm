import {getLoggedInPlayer} from 'context/app-context';
import {Card} from 'models/card';
import {GameState} from 'reducer';
import {getPlayerWithCard} from './get-player-with-card';

export function getAppropriatePlayerForAction(state: GameState, parent?: Card) {
    if (!parent) {
        return getLoggedInPlayer(state);
    }

    return getPlayerWithCard(state, parent);
}
