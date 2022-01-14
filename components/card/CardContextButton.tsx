import {ApiClient} from 'api-client';
import {ActionGuard} from 'client-server-shared/action-guard';
import {Flex} from 'components/box';
import {CardContext, DisabledTooltip} from 'components/card/Card';
import {CardButton} from 'components/card/CardButton';
import {usePaymentPopover} from 'components/popovers/payment-popover';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource-enum';
import {Card as CardModel} from 'models/card';
import React from 'react';
import {Tooltip} from 'react-tippy';
import {PlayerState, useTypedSelector} from 'reducer';
import {isActiveRound} from 'selectors/is-active-round';
import spawnExhaustiveSwitchError from 'utils';

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
    let buttonContent: React.ReactNode | null;
    const isSyncing = useTypedSelector(state => state.syncing);
    const activeRound = useTypedSelector(state => isActiveRound(state));

    function playCard(payment: PropertyCounter<Resource>, conditionalPayments?: number[]) {
        apiClient.playCardAsync({
            name: card.name,
            payment,
            conditionalPayments,
        });
    }

    const {collectPaymentAndPerformAction, triggerRef: paymentTriggerRef} =
        usePaymentPopover<HTMLButtonElement>({
            onConfirmPayment: playCard,
            opts: {
                type: 'card',
                card,
            },
        });

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
                            unmountHTMLWhenHide={true}
                            sticky={true}
                            animation="fade"
                            html={
                                !isSyncing && activeRound && reason ? (
                                    <DisabledTooltip>{reason}</DisabledTooltip>
                                ) : (
                                    <div />
                                )
                            }
                        >
                            <div>
                                <CardButton disabled>Play</CardButton>
                            </div>
                        </Tooltip>
                    );
                } else {
                    buttonContent = (
                        <CardButton
                            ref={paymentTriggerRef}
                            onClick={collectPaymentAndPerformAction}
                        >
                            Play
                        </CardButton>
                    );
                }
            }
            break;
        case CardContext.SELECT_TO_BUY:
        case CardContext.DISPLAY_ONLY:
            buttonContent = null;
            break;
        default:
            throw spawnExhaustiveSwitchError(cardContext);
    }

    if (buttonContent === null) {
        return null;
    }

    return (
        <Flex
            margin="8px"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            position="relative"
        >
            {buttonContent}
        </Flex>
    );
}
