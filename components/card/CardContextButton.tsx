import {ApiClient} from 'api-client';
import {ActionGuard} from 'client-server-shared/action-guard';
import {Flex} from 'components/box';
import {CardContext, DisabledTooltip} from 'components/card/Card';
import PaymentPopover from 'components/popovers/payment-popover';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource';
import {Card as CardModel} from 'models/card';
import React from 'react';
import {Tooltip} from 'react-tippy';
import {PlayerState} from 'reducer';
import {doesCardPaymentRequirePlayerInput} from 'selectors/does-card-payment-require-player-input';
import styled from 'styled-components';
import spawnExhaustiveSwitchError from 'utils';

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
        case CardContext.SELECT_TO_PLAY:
            {
                const [canPlay, reason] = actionGuard.canPlayCard(card);
                if (!canPlay) {
                    buttonContent = (
                        <Tooltip
                            html={reason ? <DisabledTooltip>{reason}</DisabledTooltip> : <div />}
                            animation="fade"
                        >
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
            }
            break;
        case CardContext.SELECT_TO_DISCARD:
        case CardContext.SELECT_TO_BUY:
            throw new Error('Not implemented ' + cardContext);
        case CardContext.SELECT_TO_KEEP:
            buttonContent = null;
            break;
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
