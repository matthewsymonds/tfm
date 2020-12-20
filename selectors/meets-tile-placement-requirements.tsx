import {Action} from 'constants/action';
import {Card} from 'models/card';
import {GameState, PlayerState} from 'reducer';
import {getValidPlacementsForRequirement} from 'selectors/board';
import {getAppropriatePlayerForAction} from './get-appropriate-player-for-action';

export function meetsTilePlacementRequirements(
    action: Action,
    state: GameState,
    _player: PlayerState | null,
    parent?: Card
): boolean {
    if (!action.tilePlacements) return true;

    const player = _player ?? getAppropriatePlayerForAction(state, parent);

    for (const tilePlacement of action.tilePlacements) {
        const {isRequired, placementRequirement} = tilePlacement;
        if (!isRequired || !placementRequirement) continue;
        const possiblePlacements = getValidPlacementsForRequirement(state, tilePlacement, player);
        if (possiblePlacements.length === 0) return false;
    }

    return true;
}
