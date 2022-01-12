import {Deck} from 'constants/card-types';
import {GameStage} from 'constants/game';
import {GameState} from 'reducer';

export function isActionPhase(state: GameState) {
    if (state.common.gameStage !== GameStage.ACTIVE_ROUND) {
        return false;
    }

    if (state.timeForTurmoil) {
        return false;
    }

    if (!state.options?.decks.includes(Deck.PRELUDE)) {
        return true;
    }

    // First turn in a prelude game is devoted to playing the prelude cards.
    // After that, we are in the "Action Phase" and turmoil effects/actions will apply.
    return state.common.turn > 1 || state.common.generation > 1;
}
