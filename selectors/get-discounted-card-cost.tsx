import {PlayerState} from 'reducer';
import {SerializedCard} from 'state-serialization';
import {getCard} from './get-card';

export function getDiscountedCardCost(
    serializedCard: SerializedCard,
    player: PlayerState
) {
    const card = getCard(serializedCard);
    let {cost = 0} = card;
    const {discounts} = player;

    cost -= discounts.card;
    for (const tag of card.tags) {
        cost -= discounts.tags[tag] || 0;
    }
    for (const tag of [...new Set(card.tags)]) {
        cost -= discounts.cards[tag] || 0;
    }
    cost -= discounts.nextCardThisGeneration;

    return Math.max(0, cost);
}
