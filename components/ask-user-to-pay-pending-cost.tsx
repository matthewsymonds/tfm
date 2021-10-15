import {Action, Payment} from 'constants/action';
import {Resource} from 'constants/resource-enum';
import {useApiClient} from 'hooks/use-api-client';
import React from 'react';
import {PlayerState} from 'reducer';
import {Box, Flex} from './box';
import {BaseActionIconography} from './card/CardIconography';
import PaymentPopover from './popovers/payment-popover';

export function AskUserToPayPendingCost({player}: {player: PlayerState}) {
    const cost = player.pendingCost!;
    const action: Action = {removeResource: {[Resource.MEGACREDIT]: player.pendingCost}};
    const apiClient = useApiClient();

    const handleConfirmPayment = (payment: Payment) => {
        apiClient.payPendingCostAsync({payment});
    };

    return (
        <Flex alignItems="center" flexDirection="column">
            <h2>Pay the cost you've accumulated:</h2>
            <Box>
                <PaymentPopover
                    cost={cost}
                    onConfirmPayment={payment => handleConfirmPayment(payment)}
                    shouldHide={false}
                >
                    <button>
                        <BaseActionIconography card={action} />
                    </button>
                </PaymentPopover>
            </Box>
        </Flex>
    );
}
