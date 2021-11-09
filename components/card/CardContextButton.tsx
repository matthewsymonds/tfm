import {ApiClient} from 'api-client';
import {ActionGuard} from 'client-server-shared/action-guard';
import {Flex} from 'components/box';
import {CardContext, DisabledTooltip} from 'components/card/Card';
import {CardButton} from 'components/card/CardButton';
import PaymentPopover, {HeatPaymentPopover} from 'components/popovers/payment-popover';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource-enum';
import {Card as CardModel} from 'models/card';
import React from 'react';
import {Tooltip} from 'react-tippy';
import {PlayerState, useTypedSelector} from 'reducer';
import {doesCardPaymentRequirePlayerInput} from 'selectors/does-card-payment-require-player-input';
import {getDiscountedCardCost} from 'selectors/get-discounted-card-cost';
import {getUseStoredResourcesAsHeatCard} from 'selectors/get-stored-resources-as-card';
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
    function playCard(payment: PropertyCounter<Resource>, conditionalPayments?: number[]) {
        apiClient.playCardAsync({
            name: card.name,
            payment,
            conditionalPayments,
        });
    }

    let buttonContent: React.ReactNode | null;
    const isSyncing = useTypedSelector(state => state.syncing);
    const activeRound = useTypedSelector(state => isActiveRound(state));
    const discountedCardCost = getDiscountedCardCost(card, loggedInPlayer);

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
                } else if (doesCardPaymentRequirePlayerInput(loggedInPlayer, card)) {
                    buttonContent = (
                        <PaymentPopover card={card} onConfirmPayment={playCard}>
                            <CardButton>Play</CardButton>
                        </PaymentPopover>
                    );
                } else {
                    const heatCost = card?.removeResource?.[Resource.HEAT] ?? 0;
                    if (heatCost) {
                        const useStoredResourcesAsHeatCard = getUseStoredResourcesAsHeatCard(
                            loggedInPlayer
                        );
                        if (useStoredResourcesAsHeatCard) {
                            const resource = useStoredResourcesAsHeatCard.storedResourceType;
                            const quantity = useStoredResourcesAsHeatCard.storedResourceAmount;
                            if (resource && quantity) {
                                buttonContent = (
                                    <HeatPaymentPopover
                                        cost={heatCost as number}
                                        useStoredResourcesAsHeatCard={useStoredResourcesAsHeatCard}
                                        onConfirmPayment={payment => {
                                            apiClient.playCardAsync({
                                                name: card.name,
                                                payment: {
                                                    [Resource.MEGACREDIT]: discountedCardCost,
                                                },
                                                supplementalResources: {
                                                    name: useStoredResourcesAsHeatCard.name,
                                                    quantity: payment[resource] ?? 0,
                                                },
                                            });
                                        }}
                                    >
                                        <CardButton>Play</CardButton>
                                    </HeatPaymentPopover>
                                );
                            }
                        }
                    }
                    if (!buttonContent) {
                        buttonContent = (
                            <CardButton
                                onClick={() =>
                                    playCard({[Resource.MEGACREDIT]: discountedCardCost})
                                }
                            >
                                Play
                            </CardButton>
                        );
                    }
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
