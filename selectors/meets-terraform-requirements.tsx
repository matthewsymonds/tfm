import {Card} from 'models/card';
import {GameState} from 'reducer';

export function meetsTerraformRequirements(action, state: GameState, parent?: Card): boolean {
    if (!action.requiresTerraformRatingIncrease) return true;

    return !!state.players.find(player => player.corporation.name === parent?.name)!
        .terraformedThisGeneration;
}
