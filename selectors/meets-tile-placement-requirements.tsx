import {Action} from 'constants/action';
import {Parameter, TileType} from 'constants/board';
import {MAX_PARAMETERS} from 'constants/game';
import {Card} from 'models/card';
import {GameState, getNumOceans, PlayerState} from 'reducer';
import {getValidPlacementsForRequirement} from 'selectors/board';
import {getAppropriatePlayerForAction} from './get-appropriate-player-for-action';

export function meetsTilePlacementRequirements(
    action: Action,
    state: GameState,
    _player: PlayerState | null,
    parent?: Card,
    sourceCard?: Card
): boolean {
    if (!action.tilePlacements) return true;

    const player = _player ?? getAppropriatePlayerForAction(state, parent);

    for (const tilePlacement of action.tilePlacements) {
        if (
            tilePlacement.type === TileType.OCEAN &&
            getNumOceans(state) === MAX_PARAMETERS[Parameter.OCEAN] &&
            !sourceCard
        ) {
            return false;
        }
        const {isRequired, placementRequirement} = tilePlacement;
        if (!isRequired || !placementRequirement) continue;
        const possiblePlacements = getValidPlacementsForRequirement(state, tilePlacement, player);
        if (possiblePlacements.length === 0) return false;
    }

    return true;
}
