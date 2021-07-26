import {Box, Flex} from 'components/box';
import {CardContext, DisabledTooltip} from 'components/card/Card';
import {
    GainResourceIconography,
    GainResourceOptionIconography,
    IncreaseParameterIconography,
    InlineText,
    ProductionIconography,
    RemoveResourceIconography,
    RemoveResourceOptionIconography,
    StealResourceIconography,
    TextWithMargin,
} from 'components/card/CardIconography';
import {CardText} from 'components/card/CardText';
import {TerraformRatingIcon} from 'components/icons/other';
import {ResourceIcon} from 'components/icons/resource';
import {TileIcon} from 'components/icons/tile';
import PaymentPopover, {HeatPaymentPopover} from 'components/popovers/payment-popover';
import {colors} from 'components/ui';
import {Action} from 'constants/action';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource';
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import {Card as CardModel} from 'models/card';
import React from 'react';
import {Tooltip} from 'react-tippy';
import {PlayerState, useTypedSelector} from 'reducer';
import {getUseStoredResourcesAsCard} from 'selectors/get-stored-resources-as-card';
import {isActiveRound} from 'selectors/is-active-round';
import {SupplementalResources} from 'server/api-action-handler';
import {SerializedPlayerState} from 'state-serialization';
import styled from 'styled-components';

const ActionText = styled(CardText)`
    margin-bottom: 2px;
`;

const ActionsWrapper = styled.div`
    display: flex;
    position: relative;
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
            <ProductionIconography card={{increaseProduction: action.increaseProduction}} />
        );
    }
    if (action.increaseLowestProduction) {
        elements.push(
            <ProductionIconography
                card={{
                    increaseProduction: {
                        [Resource.ANY_STANDARD_RESOURCE]: action.increaseLowestProduction,
                    },
                }}
            />
        );
    }
    if (action.increaseParameter) {
        elements.push(
            <IncreaseParameterIconography increaseParameter={action.increaseParameter} />
        );
    }
    if (action.useBlueCardActionAlreadyUsedThisGeneration) {
        elements.push(<InlineText style={{color: colors.TEXT_DARK_1}}>=&gt;</InlineText>);
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
                resourceOnCard={card?.storedResourceType}
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
    return elements.map((element, index) => <React.Fragment key={index}>{element}</React.Fragment>);
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
                opts={{showStealText: false}}
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
            <ProductionIconography card={{decreaseProduction: action.decreaseProduction}} />
        );
    }
    return elements.map((element, i) => <React.Fragment key={i}>{element}</React.Fragment>);
}

export const CardActions = ({
    card,
    cardOwner,
    cardContext,
    useCardName,
    canPlayInSpiteOfUI,
}: {
    card: CardModel;
    cardContext: CardContext;
    cardOwner?: PlayerState;
    useCardName?: boolean;
    canPlayInSpiteOfUI?: boolean;
}) => {
    if (!card.action) {
        return null;
    }

    const action = card.action;
    const actions = [...(action.choice ? action.choice : [action])];
    return (
        <ActionsWrapper>
            {(!action.lookAtCards || useCardName) && (
                <ActionText>
                    {useCardName ? (
                        <div style={{fontWeight: 600}}>{card.name}</div>
                    ) : (
                        <React.Fragment>
                            <span style={{fontWeight: 600}}>Action: </span>
                            <span>{action.text}</span>
                        </React.Fragment>
                    )}
                </ActionText>
            )}
            {actions.map((action, index) => {
                return (
                    <CardAction
                        key={card.name + '-action-' + index}
                        action={action}
                        index={index}
                        card={card}
                        cardContext={cardContext}
                        cardOwner={cardOwner}
                        canPlayInSpiteOfUI={canPlayInSpiteOfUI}
                    />
                );
            })}
        </ActionsWrapper>
    );
};

function CardAction({
    action,
    index,
    card,
    cardContext,
    cardOwner,
    canPlayInSpiteOfUI,
}: {
    action: Action;
    index: number;
    card: CardModel;
    cardContext: CardContext;
    cardOwner: SerializedPlayerState | undefined;
    canPlayInSpiteOfUI?: boolean;
}) {
    const apiClient = useApiClient();
    const isSyncing = useTypedSelector(state => state.syncing);
    const activeRound = useTypedSelector(state => isActiveRound(state));
    const loggedInPlayer = useLoggedInPlayer();
    const actionGuard = useActionGuard(cardOwner?.username ?? loggedInPlayer.username);

    const isOwnedByLoggedInPlayer =
        (cardOwner && cardOwner.index === loggedInPlayer.index) ?? false;

    let canPlay: boolean;
    let disabledReason: string;

    if (canPlayInSpiteOfUI) {
        [canPlay, disabledReason] = actionGuard.canPlayCardActionInSpiteOfUI(
            action,
            card,
            cardOwner
        );
    } else {
        [canPlay, disabledReason] = actionGuard.canPlayCardAction(action, card, cardOwner);
    }

    let tooltipText: string | null = null;

    if (!isSyncing && activeRound && cardContext === CardContext.PLAYED_CARD) {
        if (isOwnedByLoggedInPlayer) {
            tooltipText = canPlay ? null : disabledReason;
        } else {
            tooltipText = canPlay
                ? `${cardOwner?.corporation?.name} can play this.`
                : `${cardOwner?.corporation?.name} cannot play: ${disabledReason}.`;
        }
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

    function playActionWithSupplementalResources(
        action: Action,
        supplementalResources: SupplementalResources
    ) {
        if (cardContext !== CardContext.PLAYED_CARD) {
            return;
        }
        apiClient.playCardActionAsync({parent: card, supplementalResources});
    }

    function renderArrow() {
        return <TextWithMargin>{'=>'}</TextWithMargin>;
    }

    return (
        <React.Fragment>
            {index > 0 && <TextWithMargin>OR</TextWithMargin>}
            <ActionContainer
                cardContext={cardContext}
                action={action}
                playAction={playAction}
                playActionWithSupplementalResources={playActionWithSupplementalResources}
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
}

function ActionContainer({
    cardContext,
    action,
    playAction,
    playActionWithSupplementalResources,
    canPlay,
    tooltipText,
    isOwnedByLoggedInPlayer,
    loggedInPlayer,
    children,
}: {
    cardContext: CardContext;
    action: Action;
    playAction: (action: Action, payment?: PropertyCounter<Resource>) => void;
    playActionWithSupplementalResources: (
        action: Action,
        supplementalResources?: SupplementalResources
    ) => void;
    canPlay: boolean;
    tooltipText: string | null;
    isOwnedByLoggedInPlayer: boolean;
    loggedInPlayer: PlayerState | null;
    children: React.ReactNode;
}) {
    const playedCard = cardContext === CardContext.PLAYED_CARD;
    const doesActionRequireUserInput =
        (action.acceptedPayment &&
            action.acceptedPayment.some(
                resource => (loggedInPlayer?.resources[resource] ?? 0) > 0
            )) ||
        (loggedInPlayer?.corporation.name === 'Helion' &&
            loggedInPlayer?.resources[Resource.HEAT] > 0);

    if (
        canPlay &&
        isOwnedByLoggedInPlayer &&
        playedCard &&
        action.cost &&
        doesActionRequireUserInput
    ) {
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

    const heatCost = action?.removeResource?.[Resource.HEAT];

    if (canPlay && isOwnedByLoggedInPlayer && playedCard && heatCost) {
        const useStoredResourceAsCard = getUseStoredResourcesAsCard(loggedInPlayer);
        if (useStoredResourceAsCard) {
            const resource = useStoredResourceAsCard.storedResourceType;
            const quantity = useStoredResourceAsCard.storedResourceAmount;
            if (resource && quantity) {
                return (
                    <HeatPaymentPopover
                        cost={heatCost as number}
                        useStoredResourceAsCard={useStoredResourceAsCard}
                        onConfirmPayment={payment =>
                            playActionWithSupplementalResources(action, {
                                name: useStoredResourceAsCard.name,
                                quantity: (payment[resource] ?? 0) as number,
                            })
                        }
                    >
                        <ActionContainerBase>{children}</ActionContainerBase>
                    </HeatPaymentPopover>
                );
            }
        }
    }

    if (tooltipText && playedCard) {
        return (
            <Tooltip
                sticky={true}
                unmountHTMLWhenHide={true}
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
        <ActionContainerBase disabled={!canPlay || !playedCard} onClick={() => playAction(action)}>
            {children}
        </ActionContainerBase>
    );
}
