import {Resource} from 'constants/resource';
import {Tag} from 'constants/tag';
import {Card} from 'models/card';
import {PlayerState} from 'reducer';
import {getConditionalPaymentWithResourceInfo} from './get-conditional-payment-with-resource-info';

export function doesCardPaymentRequirePlayerInput(player: PlayerState, card: Card) {
    const paymentOptions: Array<[Tag, number]> = [
        [Tag.BUILDING, player.resources[Resource.STEEL]],
        [Tag.SPACE, player.resources[Resource.TITANIUM]],
    ];

    return (
        paymentOptions.some(option => {
            const [tag, resourceAmount] = option;

            return card.tags.includes(tag) && resourceAmount > 0;
        }) ||
        (player.corporation.name === 'Helion' && player.resources[Resource.HEAT] > 0) ||
        !!getConditionalPaymentWithResourceInfo(player, card)
    );
}
