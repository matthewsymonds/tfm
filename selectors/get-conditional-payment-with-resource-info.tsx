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
    name: string;
};

export function getConditionalPaymentWithResourceInfo(
    player: SerializedPlayerState,
    card: Card | undefined
): ConditionalPaymentWithResourceInfo[] {
    const result: ConditionalPaymentWithResourceInfo[] = [];
    for (const playedCard of getPlayedCards(player)) {
        const {conditionalPayment, storedResourceAmount, name} = playedCard;
        if (conditionalPayment) {
            const {tag} = conditionalPayment;
            if (card?.tags.includes(tag) && storedResourceAmount) {
                result.push({
                    ...conditionalPayment,
                    resourceType: playedCard.storedResourceType!,
                    resourceAmount: storedResourceAmount,
                    name,
                });
            }
        }
    }

    return result;
}
