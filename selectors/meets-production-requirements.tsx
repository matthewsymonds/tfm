import {Action} from 'constants/action';
import {MinimumProductions} from 'constants/game';
import {STANDARD_RESOURCES} from 'constants/resource';
import {Resource} from 'constants/resource-enum';
import {Card} from 'models/card';
import {GameState, PlayerState} from 'reducer';
import {convertAmountToNumber} from './convert-amount-to-number';
import {getAppropriatePlayerForAction} from './get-appropriate-player-for-action';

export function meetsProductionRequirements(
    action: Action | Card,
    state: GameState,
    _player: PlayerState | null,
    parent?: Card,
    sourceCard?: Card
) {
    const player = _player ?? getAppropriatePlayerForAction(state, parent);

    const {decreaseProduction, decreaseAnyProduction} = action;

    for (const production in decreaseProduction) {
        const productions =
            production === Resource.ANY_STANDARD_RESOURCE
                ? STANDARD_RESOURCES
                : [production];
        if (
            productions.some(resource => {
                const decrease = convertAmountToNumber(
                    decreaseProduction[production],
                    state,
                    player
                );
                const newLevel = player.productions[resource] - decrease;
                return newLevel < MinimumProductions[production];
            })
        ) {
            return false;
        }
    }

    for (const production in decreaseAnyProduction) {
        for (const p of state.players) {
            if (
                p.productions[production] - decreaseAnyProduction[production] >=
                MinimumProductions[production]
            ) {
                return true;
            }
        }

        return false;
    }

    return true;
}
