import {GameStage} from 'constants/game';
import {GameState} from 'reducer';

export function isActiveRound(state: GameState): boolean {
    return state.common.gameStage === GameStage.ACTIVE_ROUND;
}
