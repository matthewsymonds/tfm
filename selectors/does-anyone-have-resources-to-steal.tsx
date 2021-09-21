import {Action} from 'constants/action';
import {PROTECTED_HABITAT_RESOURCE} from 'constants/resource';
import {Resource} from 'constants/resource-enum';
import {Card} from 'models/card';
import {GameState, PlayerState} from 'reducer';
import {getCard} from 'selectors/get-card';
import {getAppropriatePlayerForAction} from './get-appropriate-player-for-action';

export function doesAnyoneHaveResourcesToSteal(
    action: Action,
    state: GameState,
    _player: PlayerState | null,
    card?: Card
) {
    const loggedInPlayer = _player ?? getAppropriatePlayerForAction(state, card);
    if (action && action instanceof Card) {
        // You can play a card without completing the theft.
        return true;
    }
    // Otherwise, every other "stealResource" is a storedResource. So we only support that.
    for (const resource in action.stealResource) {
        for (const player of state.players) {
            if (player.playedCards.find(card => card.name === 'Protected Habitats')) {
                if (PROTECTED_HABITAT_RESOURCE.includes(resource as Resource)) {
                    if (player.username !== loggedInPlayer.username) {
                        continue;
                    }
                }
            }
            for (const playedCard of player.playedCards) {
                const hydratedCard = getCard(playedCard);
                if (hydratedCard.name === 'Pets') {
                    continue;
                }
                if (
                    hydratedCard.storedResourceType === resource &&
                    hydratedCard.storedResourceAmount
                ) {
                    return true;
                }
            }
        }

        return false;
    }

    return true;
}
