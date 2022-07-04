import {LOBBYING_COST} from 'constants/turmoil';
import {GameState, PlayerState} from 'reducer';

export function getLobbyingAction(state: GameState, player: PlayerState) {
    const turmoil = state.common.turmoil!;
    const freeDelegate = turmoil.lobby[player.index];
    return {
        cost: freeDelegate ? 0 : LOBBYING_COST,
        placeDelegatesInOneParty: 1,
    };
}
