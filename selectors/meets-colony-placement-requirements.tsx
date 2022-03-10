import {Action} from 'constants/action';
import {GameState, PlayerState} from 'reducer';
import {canPlaceColony} from './can-build-colony';

export function meetsColonyPlacementRequirements(
    action: Action,
    state: GameState,
    player: PlayerState
): boolean {
    if (!action.placeColony) {
        // The action does not attempt to place a colony.
        return true;
    }

    const colonies = state.common?.colonies ?? [];
    return colonies.some(
        colony => canPlaceColony(colony, player.index, action.placeColony)[0]
    );
}
