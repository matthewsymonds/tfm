import {Card as CardModel} from 'models/card';
import {CardContext, DisabledTooltip} from 'components/card/Card';
import spawnExhaustiveSwitchError from 'utils';
import {ActionGuard} from 'client-server-shared/action-guard';
import {ApiClient} from 'api-client';
import {doesCardPaymentRequirePlayerInput} from 'context/app-context';
import React from 'react';
import {PlayerState} from 'reducer';
import styled from 'styled-components';
import PaymentPopover from 'components/popovers/payment-popover';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource';
import {Flex} from 'components/box';
import {Tooltip} from 'react-tippy';

const CardButton = styled.button`
    width: 80px;
`;

export function CardContextButton({
    card,
    cardContext,
    actionGuard,
    loggedInPlayer,
    apiClient,
}: {
    card: CardModel;
    cardContext: CardContext;
    actionGuard: ActionGuard;
    apiClient: ApiClient;
    loggedInPlayer: PlayerState;
}) {
    function playCard(payment?: PropertyCounter<Resource>) {
        apiClient.playCardAsync({card, payment});
    }

    let buttonContent: React.ReactNode | null;

    switch (cardContext) {
        case CardContext.NONE:
        case CardContext.PLAYED_CARD:
            buttonContent = null;
            break;
        case CardContext.SELECT_TO_PLAY: {
            const [canPlay, reason] = actionGuard.canPlayCard(card);
            if (!canPlay) {
                buttonContent = (
                    <Tooltip html={<DisabledTooltip>{reason}</DisabledTooltip>} animation="fade">
                        <div>
                            <CardButton disabled>Play</CardButton>
                        </div>
                    </Tooltip>
                );
            } else if (doesCardPaymentRequirePlayerInput(loggedInPlayer, card)) {
                buttonContent = (
                    <PaymentPopover card={card} onConfirmPayment={playCard}>
                        <CardButton>Play</CardButton>
                    </PaymentPopover>
                );
            } else {
                buttonContent = <CardButton onClick={() => playCard()}>Play</CardButton>;
            }
            break;
        }
        case CardContext.SELECT_TO_DISCARD:
        case CardContext.SELECT_TO_KEEP:
            throw new Error('Not implemented ' + cardContext);
        default:
            throw spawnExhaustiveSwitchError(cardContext);
    }

    if (buttonContent === null) {
        return null;
    }

    return (
        <Flex margin="8px" flexDirection="column" alignItems="center" justifyContent="center">
            {buttonContent}
        </Flex>
    );
}
