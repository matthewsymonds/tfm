import {Action} from 'constants/action';
import {MinimumProductions} from 'constants/game';
import {Card} from 'models/card';
import {GameState, PlayerState} from 'reducer';
import {convertAmountToNumber} from './convert-amount-to-number';
import {getAppropriatePlayerForAction} from './get-appropriate-player-for-action';

export function meetsProductionRequirements(
    action: Action,
    state: GameState,
    _player: PlayerState | null,
    parent?: Card
) {
    const player = _player ?? getAppropriatePlayerForAction(state, parent);

    const {decreaseProduction, decreaseAnyProduction} = action;

    for (const production in decreaseProduction) {
        const decrease = convertAmountToNumber(decreaseProduction[production], state, player);
        if (player.productions[production] - decrease < MinimumProductions[production]) {
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
