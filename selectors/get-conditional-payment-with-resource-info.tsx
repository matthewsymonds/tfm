import {Resource} from 'constants/resource';
import {Tag} from 'constants/tag';
import {Card} from 'models/card';
import {SerializedPlayerState} from 'state-serialization';
import {getPlayedCards} from './get-played-cards';

type ConditionalPaymentWithResourceInfo = {
    tag: Tag;
    rate: number;
    resourceType: Resource;
    resourceAmount: number;
};

export function getConditionalPaymentWithResourceInfo(
    player: SerializedPlayerState,
    card: Card | undefined
): ConditionalPaymentWithResourceInfo | undefined {
    const cardWithConditionalPayment = getPlayedCards(player).find(playedCard => {
        const tag = playedCard.conditionalPayment?.tag;
        const {storedResourceAmount} = playedCard;
        if (tag && storedResourceAmount) {
            return card?.tags.includes(tag) && storedResourceAmount;
        }
    });
    if (cardWithConditionalPayment?.conditionalPayment) {
        return {
            ...cardWithConditionalPayment.conditionalPayment,
            resourceType: cardWithConditionalPayment?.storedResourceType!,
            resourceAmount: cardWithConditionalPayment?.storedResourceAmount ?? 0,
        };
    }
}
