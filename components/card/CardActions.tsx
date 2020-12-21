import {ApiClient} from 'api-client';
import {ActionGuard} from 'client-server-shared/action-guard';
import {Box, Flex} from 'components/box';
import {CardContext, DisabledTooltip} from 'components/card/Card';
import {
    DecreaseProductionIconography,
    GainResourceIconography,
    GainResourceOptionIconography,
    IncreaseParameterIconography,
    IncreaseProductionIconography,
    RemoveResourceIconography,
    RemoveResourceOptionIconography,
    StealResourceIconography,
    TextWithMargin,
} from 'components/card/CardIconography';
import {TerraformRatingIcon} from 'components/icons/other';
import {ResourceIcon} from 'components/icons/resource';
import {TileIcon} from 'components/icons/tile';
import PaymentPopover from 'components/popovers/payment-popover';
import {Action} from 'constants/action';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource';
import {AppContext} from 'context/app-context';
import {Card as CardModel} from 'models/card';
import React, {useContext} from 'react';
import {Tooltip} from 'react-tippy';
import {PlayerState, useTypedSelector} from 'reducer';
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
    const elements: Array<React.ReactNode> = [];
    if (action.stealResource) {
        elements.push(
            <GainResourceIconography
                gainResource={action.stealResource}
                opts={{
                    isInline: true,
                }}
            />
        );
    }
    if (action.gainResourceOption) {
        elements.push(
            <GainResourceOptionIconography
                gainResourceOption={action.gainResourceOption}
                opts={{useSlashSeparator: true, isInline: true}}
            />
        );
    }
    if (action.increaseProduction) {
        elements.push(
            <IncreaseProductionIconography increaseProduction={action.increaseProduction} />
        );
    }
    if (action.increaseParameter) {
        elements.push(
            <IncreaseParameterIconography increaseParameter={action.increaseParameter} />
        );
    }
    if (action.gainResource) {
        // if this action also has a remove, lets explicit mark the gain with a +
        const shouldShowPlus = Object.keys(action?.removeResource ?? {}).length > 0;

        elements.push(
            <GainResourceIconography
                gainResource={action.gainResource}
                opts={{
                    isInline: true,
                    shouldShowPlus,
                }}
            />
        );
    }
    if (action.increaseTerraformRating) {
        if (action.increaseTerraformRating !== 1) {
            throw new Error('render right side of error - ' + card?.name);
        }
        elements.push(<TerraformRatingIcon size={16} />);
    }
    if (action.tilePlacements) {
        elements.push(
            <React.Fragment>
                {action.tilePlacements.map((tilePlacement, index) => (
                    <TileIcon type={tilePlacement.type} key={index} size={24} />
                ))}
            </React.Fragment>
        );
    }
    if (action.lookAtCards) {
        elements.push(
            <Box marginLeft="8px" display="flex">
                <ActionText>{action.text}</ActionText>
            </Box>
        );
    }
    return elements.length ? elements : null;
}

export function renderLeftSideOfArrow(action: Action, card?: CardModel) {
    const elements: Array<React.ReactNode> = [];
    if (action.cost) {
        elements.push(
            <div style={{display: 'inline-flex', alignItems: 'center'}}>
                <ResourceIcon name={Resource.MEGACREDIT} amount={`${action.cost}`} />
                {action.acceptedPayment && <span style={{marginLeft: 2}}>*</span>}
            </div>
        );
    }
    if (action.stealResource) {
        elements.push(
            <StealResourceIconography
                stealResource={action.stealResource}
                opts={{shouldShowStealText: false}}
            />
        );
    }
    if (action.removeResourceOption) {
        elements.push(
            <RemoveResourceOptionIconography
                removeResourceOption={action.removeResourceOption}
                sourceType={action.removeResourceSourceType}
            />
        );
    }
    if (action.removeResource) {
        elements.push(
            <RemoveResourceIconography
                removeResource={action.removeResource}
                sourceType={action.removeResourceSourceType}
                opts={{
                    isInline: true,
                }}
            />
        );
    }
    if (action.decreaseProduction) {
        elements.push(
            <DecreaseProductionIconography
                decreaseProduction={action.decreaseProduction}
                opts={{isInline: true}}
            />
        );
    }
    return elements.length ? elements : null;
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
    const isSyncing = useTypedSelector(state => state.syncing);

    const appContext = useContext(AppContext);
    const loggedInPlayer = appContext.getLoggedInPlayer(state) ?? null;
    const isOwnedByLoggedInPlayer =
        (cardOwner && cardOwner.index === loggedInPlayer.index) ?? false;

    const action = card.action;

    function renderArrow() {
        return <TextWithMargin>{'=>'}</TextWithMargin>;
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
                let tooltipText: string | null = null;
                if (!isSyncing && cardContext === CardContext.PLAYED_CARD) {
                    if (isOwnedByLoggedInPlayer) {
                        tooltipText = canPlay ? null : disabledReason;
                    } else {
                        tooltipText = canPlay
                            ? `${cardOwner?.corporation?.name} can play this.`
                            : `${cardOwner?.corporation?.name} cannot play: ${disabledReason}.`;
                    }
                }
                return (
                    <React.Fragment>
                        {index > 0 && <TextWithMargin>OR</TextWithMargin>}
                        <ActionContainer
                            action={action}
                            playAction={playAction}
                            canPlay={canPlay}
                            tooltipText={tooltipText}
                            loggedInPlayer={loggedInPlayer}
                            isOwnedByLoggedInPlayer={isOwnedByLoggedInPlayer}
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
    canPlay,
    tooltipText,
    isOwnedByLoggedInPlayer,
    loggedInPlayer,
    children,
}: {
    action: Action;
    playAction: (action: Action, payment?: PropertyCounter<Resource>) => void;
    canPlay: boolean;
    tooltipText: string | null;
    isOwnedByLoggedInPlayer: boolean;
    loggedInPlayer: PlayerState | null;
    children: React.ReactNode;
}) {
    const doesActionRequireUserInput =
        action.acceptedPayment ||
        (loggedInPlayer?.corporation.name === 'Helion' &&
            loggedInPlayer?.resources[Resource.HEAT] > 0);

    if (canPlay && isOwnedByLoggedInPlayer && action.cost && doesActionRequireUserInput) {
        return (
            <PaymentPopover
                cost={action.cost}
                action={action}
                onConfirmPayment={payment => playAction(action, payment)}
            >
                <ActionContainerBase>{children}</ActionContainerBase>
            </PaymentPopover>
        );
    }

    if (tooltipText) {
        return (
            <Tooltip
                sticky={true}
                animation="fade"
                html={<DisabledTooltip>{tooltipText}</DisabledTooltip>}
            >
                <ActionContainerBase
                    disabled={!canPlay || !isOwnedByLoggedInPlayer}
                    onClick={() => {}}
                >
                    {children}
                </ActionContainerBase>
            </Tooltip>
        );
    }

    return (
        <ActionContainerBase disabled={!canPlay} onClick={() => playAction(action)}>
            {children}
        </ActionContainerBase>
    );
}