import { ApiClient } from 'api-client';
import { ActionGuard } from 'client-server-shared/action-guard';
import { Box, Flex } from 'components/box';
import { CardContext, DisabledTooltip } from 'components/card/Card';
import {
    renderDecreaseProductionIconography,
    renderGainResourceIconography,
    renderGainResourceOptionIconography,
    renderIncreaseProductionIconography,
    renderRemoveResourceIconography,
    renderRemoveResourceOptionIconography,
    TextWithSpacing
} from 'components/card/CardIconography';
import { GlobalParameterIcon } from 'components/icons/global-parameter';
import { TerraformRatingIcon } from 'components/icons/other';
import { ResourceIcon } from 'components/icons/resource';
import { TileIcon } from 'components/icons/tile';
import PaymentPopover from 'components/popovers/payment-popover';
import { Action } from 'constants/action';
import { Parameter } from 'constants/board';
import { PropertyCounter } from 'constants/property-counter';
import { Resource } from 'constants/resource';
import { VariableAmount } from 'constants/variable-amount';
import { AppContext } from 'context/app-context';
import { Card as CardModel } from 'models/card';
import React, { useContext } from 'react';
import { Tooltip } from 'react-tippy';
import { PlayerState, useTypedSelector } from 'reducer';
import styled from 'styled-components';

const ActionText = styled.span`
    font-size: 10px;
`;

const ActionsWrapper = styled.div`
    display: flex;
    margin: 4px;
    align-items: center;
    justify-content: center;
    flex-direction: column;
`;

const ActionContainerBase = styled.button`
    border: 2px dashed blue;
    margin: 3px;
    background-color: initial;

    &:hover:not(:disabled) {
        cursor: initial;
        background-color: lightblue;
    }
`;

export function renderRightSideOfArrow(action: Action, card?: CardModel) {
    if (action.stealResource) {
        return renderGainResourceIconography(action.stealResource, {isInline: true});
    } else if (action.gainResourceOption) {
        return renderGainResourceOptionIconography(action.gainResourceOption);
    } else if (action.increaseProduction) {
        return renderIncreaseProductionIconography(action.increaseProduction);
    } else if (action.gainResource) {
        return renderGainResourceIconography(action.gainResource, {
            isInline: true,
            shouldShowPlus:
                action.removeResource?.[Resource.CARD] === VariableAmount.USER_CHOICE_UP_TO_ONE,
        });
    } else if (action.increaseTerraformRating) {
        if (action.increaseTerraformRating !== 1) {
            throw new Error('render right side of error - ' + card?.name);
        }
        return <TerraformRatingIcon size={16} />;
    } else if (action.tilePlacements) {
        return (
            <React.Fragment>
                {action.tilePlacements.map((tilePlacement, index) => (
                    <TileIcon type={tilePlacement.type} key={index} size={24} />
                ))}
            </React.Fragment>
        );
    } else if (action.lookAtCards) {
        return (
            <Box marginLeft="8px" display="flex">
                <ActionText>{action.text}</ActionText>
            </Box>
        );
    } else if (action.increaseParameter) {
        const elements: Array<React.ReactNode> = [];
        for (const [parameter, amount] of Object.entries(action.increaseParameter)) {
            elements.push(
                ...Array(amount)
                    .fill(null)
                    .map((_, index) => (
                        <GlobalParameterIcon
                            key={index}
                            parameter={parameter as Parameter}
                            size={16}
                        />
                    ))
            );
        }
        return elements;
    } else {
        return null;
    }
}

export function renderLeftSideOfArrow(action: Action, card?: CardModel) {
    if (action.cost) {
        return (
            <React.Fragment>
                <ResourceIcon name={Resource.MEGACREDIT} amount={`${action.cost}`} />
            </React.Fragment>
        );
    } else if (action.stealResource) {
        return (
            <React.Fragment>
                {Object.keys(action.stealResource).map((resource, index) => {
                    return (
                        <ResourceIcon
                            key={index}
                            name={resource as Resource}
                            size={16}
                            showRedBorder={true}
                        />
                    );
                })}
            </React.Fragment>
        );
    } else if (action.removeResourceOption) {
        return renderRemoveResourceOptionIconography(
            action.removeResourceOption,
            action.removeResourceSourceType
        );
    } else if (action.removeResource) {
        return renderRemoveResourceIconography(
            action.removeResource,
            action.removeResourceSourceType,
            {
                isInline: true,
            }
        );
    } else if (action.decreaseProduction) {
        return renderDecreaseProductionIconography(action.decreaseProduction, {isInline: true});
    } else {
        return null;
    }
}

export const CardActions = ({
    card,
    cardOwner,
    cardContext,
    apiClient,
    actionGuard,
}: {
    card: CardModel;
    cardContext: CardContext;
    cardOwner?: PlayerState;
    apiClient: ApiClient;
    actionGuard: ActionGuard;
}) => {
    if (!card.action) {
        return null;
    }
    const state = useTypedSelector(state => state);
    const appContext = useContext(AppContext);
    const loggedInPlayer = appContext.getLoggedInPlayer(state) ?? null;
    const isOwnedByLoggedInPlayer =
        (cardOwner && cardOwner.index === loggedInPlayer.index) ?? false;

    const action = card.action;

    function renderArrow() {
        return <TextWithSpacing>{'=>'}</TextWithSpacing>;
    }

    function playAction(action: Action, payment?: PropertyCounter<Resource>) {
        if (cardContext !== CardContext.PLAYED_CARD) {
            return;
        }
        if (card.action?.choice) {
            const choiceIndex = card.action.choice.indexOf(action);
            return apiClient.playCardActionAsync({parent: card, choiceIndex, payment});
        }
        apiClient.playCardActionAsync({parent: card, payment});
    }

    const actions = [...(action.choice ? action.choice : [action])];
    return (
        <ActionsWrapper>
            {!action.lookAtCards && <ActionText>{action.text}</ActionText>}
            {actions.map((action, index) => {
                const [canPlay, disabledReason] = actionGuard.canPlayCardAction(
                    action,
                    state,
                    card
                );
                return (
                    <React.Fragment>
                        {index > 0 && <TextWithSpacing>OR</TextWithSpacing>}
                        <ActionContainer
                            action={action}
                            playAction={playAction}
                            isDisabled={
                                cardContext !== CardContext.PLAYED_CARD ||
                                !isOwnedByLoggedInPlayer ||
                                !canPlay
                            }
                            cardContext={cardContext}
                            disabledReason={disabledReason}
                            loggedInPlayer={loggedInPlayer}
                        >
                            <Flex alignItems="center" justifyContent="center" margin="4px">
                                {renderLeftSideOfArrow(action, card)}
                                {renderArrow()}
                                {renderRightSideOfArrow(action, card)}
                            </Flex>
                        </ActionContainer>
                    </React.Fragment>
                );
            })}
        </ActionsWrapper>
    );
};

function ActionContainer({
    action,
    playAction,
    isDisabled,
    loggedInPlayer,
    cardContext,
    children,
    disabledReason,
}: {
    action: Action;
    playAction: (action: Action, payment?: PropertyCounter<Resource>) => void;
    isDisabled: boolean;
    loggedInPlayer: PlayerState | null;
    cardContext: CardContext;
    disabledReason: string;
    children: React.ReactNode;
}) {
    const doesActionRequireUserInput =
        action.acceptedPayment ||
        (loggedInPlayer?.corporation.name === 'Helion' &&
            loggedInPlayer?.resources[Resource.HEAT] > 0);

    if (!isDisabled && action.cost && doesActionRequireUserInput) {
        return (
            <PaymentPopover
                cost={action.cost}
                onConfirmPayment={payment => playAction(action, payment)}
            >
                <ActionContainerBase disabled={isDisabled}>{children}</ActionContainerBase>
            </PaymentPopover>
        );
    }

    if (isDisabled && cardContext === CardContext.PLAYED_CARD) {
        return (
            <Tooltip
                html={disabledReason ? <DisabledTooltip>{disabledReason}</DisabledTooltip> : <div />}
            >
                <ActionContainerBase disabled={isDisabled} onClick={() => playAction(action)}>
                    {children}
                </ActionContainerBase>
            </Tooltip>
        );
    }

    return (
        <ActionContainerBase disabled={isDisabled} onClick={() => playAction(action)}>
            {children}
        </ActionContainerBase>
    );
}
