import {AcceptedTradePayment, ACCEPTED_TRADE_PAYMENT} from 'constants/colonies';
import {Resource} from 'constants/resource-enum';
import {PlayerState} from 'reducer';

export function getValidTradePayment(player: PlayerState): AcceptedTradePayment[] {
    let tradeOptions = ACCEPTED_TRADE_PAYMENT.map(payment => {
        return {
            resource: payment.resource,
            quantity: payment.quantity - player.discounts.trade,
        };
    });

    tradeOptions = tradeOptions.filter(option => {
        let playerResourceQuantity = player.resources[option.resource];
        if (option.resource === Resource.MEGACREDIT && player.corporation.name === 'Helion') {
            playerResourceQuantity += player.resources[Resource.HEAT];
        }
        return option.quantity <= playerResourceQuantity;
    });

    return tradeOptions;
}
