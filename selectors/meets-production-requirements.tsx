import {canPlayActionInSpiteOfUI} from 'client-server-shared/action-guard';
import {Action} from 'constants/action';
import {getColony, MAX_NUM_COLONIES} from 'constants/colonies';
import {MinimumProductions} from 'constants/game';
import {Resource} from 'constants/resource-enum';
import {Card} from 'models/card';
import {GameState, PlayerState} from 'reducer';
import {
    ActionCardPair,
    EffectEvent,
    getActionsFromEffectForPlayer,
} from 'server/api-action-handler';
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
        const decrease = convertAmountToNumber(decreaseProduction[production], state, player);
        const newLevel = player.productions[production] - decrease;
        if (newLevel < MinimumProductions[production]) {
            // We can do some complex checks to see if the player has a last-chance way to *possibly* play the card.
            const delta = getEffectsDelta(
                state,
                player,
                action,
                production as Resource,
                sourceCard
            );
            return newLevel + delta >= MinimumProductions[production];
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
// Note: this function *probably* should account for increaseProductionOption and choice cards.
function getEffectsDelta(
    state: GameState,
    player: PlayerState,
    action: Action | Card,
    production: Resource,
    sourceCard?: Card
) {
    // We should only do this stuff for cards, not standard projects or anything else.
    if (!sourceCard) {
        return 0;
    }

    const tags = 'isCard' in action ? action.tags : sourceCard ? sourceCard.tags : [];
    const additionalCards = 'isCard' in action ? [action] : sourceCard ? [sourceCard] : [];

    const actionCardPairs: ActionCardPair[] = [];

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

    if (tags.length > 0) {
        const event: EffectEvent = {
            tags: tags,
        };
        actionCardPairs.push(
            ...getActionsFromEffectForPlayer(player, event, player, additionalCards)
        );
    }

    const actions = actionCardPairs.map(pair => {
        let action: Action | undefined;
        let card: Card;
        [action, card] = pair;
        if (action.choice) {
            action = action.choice.find(action => action.increaseProduction?.[production]);
            if (!action || !canPlayActionInSpiteOfUI(action, state, player, card)[0]) {
                return undefined;
            }
        }

        return action;
    });

    const increases = actions.map(action => action?.increaseProduction?.[production] ?? 0);

    let total = 0;
    for (const increase of increases) {
        if (!increase) continue;
        total += convertAmountToNumber(increase, state, player);
    }

    // Account for Luna letting you place Minority Refuge or Pioneer Settlement
    if (action.placeColony) {
        const colonies = state.common.colonies ?? [];
        const richColonies = colonies.map(getColony);

        const coloniesWithSpace = richColonies.filter(colony => {
            const matchingColony = state.common.colonies?.find(
                stateColony => stateColony.name === colony.name
            );

            return matchingColony?.colonies.length ?? Infinity < MAX_NUM_COLONIES;
        });

        total += Math.max(
            ...coloniesWithSpace.map(colony =>
                convertAmountToNumber(
                    colony.colonyPlacementBonus?.increaseProduction?.[production] ?? 0,
                    state,
                    player
                )
            )
        );
    }

    return total;
}
