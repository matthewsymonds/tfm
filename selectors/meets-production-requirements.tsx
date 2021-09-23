import {Action} from 'constants/action';
import {MinimumProductions} from 'constants/game';
import {Resource} from 'constants/resource-enum';
import {Card} from 'models/card';
import {GameState, PlayerState} from 'reducer';
import {EffectEvent, getActionsFromEffectForPlayer} from 'server/api-action-handler';
import {convertAmountToNumber} from './convert-amount-to-number';
import {getAppropriatePlayerForAction} from './get-appropriate-player-for-action';

export function meetsProductionRequirements(
    action: Action | Card,
    state: GameState,
    _player: PlayerState | null,
    parent?: Card
) {
    const player = _player ?? getAppropriatePlayerForAction(state, parent);

    const {decreaseProduction, decreaseAnyProduction} = action;

    for (const production in decreaseProduction) {
        const decrease = convertAmountToNumber(decreaseProduction[production], state, player);
        const newLevel =
            player.productions[production] -
            decrease +
            getEffectsDelta(state, player, action, production as Resource);
        if (newLevel < MinimumProductions[production]) {
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

// Ensure that, if an effect exists that will increase your production,
// in such a way that it counters your decreased production dipping beneath the minimum,
// that you can still play the card.
// Example: Immigrant city when Tharsis is at -5 MC production.
// Tharsis's effect should counter the lost megacredit production so
// the user should be able to play.
function getEffectsDelta(
    state: GameState,
    player: PlayerState,
    action: Action | Card,
    production: Resource
) {
    if (!('isCard' in action)) {
        return 0;
    }

    const event: EffectEvent = {
        tags: action.tags,
    };

    const additionalCards = [action];

    const actionCardPairs = getActionsFromEffectForPlayer(player, event, player, additionalCards);

    for (const tilePlacement of action.tilePlacements ?? []) {
        const event: EffectEvent = {
            placedTile: tilePlacement.type,
        };

        actionCardPairs.push(
            ...getActionsFromEffectForPlayer(player, event, player, additionalCards)
        );
    }

    if (action.cost) {
        const event: EffectEvent = {
            cost: action.cost,
        };
        actionCardPairs.push(
            ...getActionsFromEffectForPlayer(player, event, player, additionalCards)
        );
    }

    const actions = actionCardPairs.map(pair => pair[0]);

    const increases = actions
        .map(action => action.increaseProduction?.[production])
        .filter(Boolean);

    let total = 0;
    for (const increase of increases) {
        if (!increase) continue;
        total += convertAmountToNumber(increase, state, player);
    }

    return total;
}
