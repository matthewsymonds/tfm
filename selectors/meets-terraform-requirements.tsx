import {Action} from 'constants/action';
import {PlayerState} from 'reducer';

export function meetsTerraformRequirements(action: Action, player: PlayerState): boolean {
    if (!action.requiresTerraformRatingIncrease) return true;

    return !!player.terraformedThisGeneration;
}
