import {AcceptedTradePayment, ACCEPTED_TRADE_PAYMENT} from 'constants/colonies';
import {PlayerState} from 'reducer';

export function getValidTradePayment(player: PlayerState): AcceptedTradePayment[] {
    let tradeOptions = ACCEPTED_TRADE_PAYMENT.map(payment => {
        return {
            resource: payment.resource,
            quantity: payment.quantity - player.discounts.trade,
        };
    });

    tradeOptions = tradeOptions.filter(option => {
        return option.quantity <= player.resources[option.resource];
    });

    return tradeOptions;
}
