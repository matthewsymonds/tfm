import {ApiClient} from 'api-client';
import {ActionGuard} from 'client-server-shared/action-guard';
import {Flex} from 'components/box';
import {Button} from 'components/button';
import {CardContext, DisabledTooltip} from 'components/card/Card';
import {usePaymentPopover} from 'components/popovers/payment-popover';
import {MaybeTooltip, Tooltip} from 'components/tooltip';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource-enum';
import {Card as CardModel} from 'models/card';
import React from 'react';
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

    function playCard(
        payment: PropertyCounter<Resource>,
        conditionalPayments?: number[]
    ) {
        apiClient.playCardAsync({
            name: card.name,
            payment,
            conditionalPayments,
        });
    }

    const {renderPaymentButton, onPaymentButtonClick} =
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
                        <MaybeTooltip
                            shouldShowTooltip={Boolean(
                                isSyncing && activeRound && reason
                            )}
                            content={
                                <DisabledTooltip>{reason}</DisabledTooltip>
                            }
                        >
                            <Button disabled onClick={() => {}}>
                                Play
                            </Button>
                        </MaybeTooltip>
                    );
                } else {
                    buttonContent = renderPaymentButton(
                        <Button onClick={onPaymentButtonClick}>Play</Button>
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
