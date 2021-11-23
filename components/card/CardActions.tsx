import {Box, Flex} from 'components/box';
import {CardContext} from 'components/card/Card';
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
import {DelegateComponent} from 'components/delegate';
import {TerraformRatingIcon} from 'components/icons/other';
import {ResourceIcon} from 'components/icons/resource';
import {TileIcon} from 'components/icons/tile';
import PaymentPopover, {HeatPaymentPopover} from 'components/popovers/payment-popover';
import {colors} from 'components/ui';
import {Action} from 'constants/action';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource-enum';
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import {Card as CardModel} from 'models/card';
import React from 'react';
import {PlayerState} from 'reducer';
import {getUseStoredResourcesAsHeatCard} from 'selectors/get-stored-resources-as-card';
import {SupplementalResources} from 'server/api-action-handler';
import {SerializedPlayerState} from 'state-serialization';
import styled from 'styled-components';

const ActionText = styled(CardText)``;

const ActionsWrapper = styled.div`
    display: flex;
    position: relative;
    margin: 4px;
    align-items: center;
    justify-content: center;
    flex-direction: column;
`;

export const ActionContainerBase = styled.button`
    background-color: initial;
    padding: 4px;

    &:disabled {
        color: initial;
        background-color: initial;
    }

    border: 2px solid ${colors.DARK_2};
    border-radius: 4px;

    -webkit-transition: color 200ms ease-in-out, background-color 200ms ease-in-out,
        transform 50ms ease-in-out;
    transition: color 200ms ease-in-out, background-color 200ms ease-in-out,
        transform 50ms ease-in-out;
    &:hover:not(:disabled),
    &:focus:not(:disabled) {
        color: #fff;
        outline: 0;
        background-color: ${colors.DARK_2};
    }
    &:active:not(:disabled) {
        transform: scale(0.95);
    }

    &:hover:not(:disabled) {
        cursor: initial;
    }
`;

export function LookAtCards({text}: {text: string}) {
    return (
        <Box marginLeft="8px" display="flex">
            <ActionText>{text}</ActionText>
        </Box>
    );
}

export function renderRightSideOfArrow(
    action: Action,
    storedResourceType?: Resource,
    shouldShowPlusAllowed?: boolean,
    inline?: boolean
) {
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
            <ProductionIconography
                inline={inline}
                card={{increaseProduction: action.increaseProduction}}
            />
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
        elements.push(<InlineText style={{color: colors.TEXT_DARK_1}}>{renderArrow()}</InlineText>);
    }
    if (action.gainResource) {
        // if this action also has a remove, lets explicitly mark the gain with a +
        const shouldShowPlus =
            Object.keys(action?.removeResource ?? {}).length > 0 && shouldShowPlusAllowed;

        elements.push(
            <GainResourceIconography
                gainResource={action.gainResource}
                opts={{
                    isInline: true,
                    shouldShowPlus,
                }}
                resourceOnCard={storedResourceType}
            />
        );
    }
    if (action.increaseTerraformRating) {
        if (action.increaseTerraformRating !== 1) {
            throw new Error('render right side of error - ');
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
        elements.push(<LookAtCards text={action.text ?? 'Look at cards'} />);
    }

    if (action.placeDelegatesInOneParty) {
        for (let i = 0; i < action.placeDelegatesInOneParty; i++) {
            elements.push(<DelegateComponent delegate={{}} isLeader={false} />);
        }
    }

    if (elements.length === 1) {
        return elements[0];
    }

    return (
        <Flex
            marginTop="-4px"
            marginLeft="-4px"
            flexWrap="wrap"
            justifyContent="center"
            alignItems="center"
        >
            {elements.map((element, index) => (
                <Box marginTop="4px" marginLeft="4px" key={index}>
                    {element}
                </Box>
            ))}
        </Flex>
    );
}

export function renderLeftSideOfArrow(action: Action) {
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
                opts={{locationType: action.removeResourceSourceType}}
            />
        );
    }
    if (action.removeResource) {
        elements.push(
            <RemoveResourceIconography
                removeResource={action.removeResource}
                opts={{
                    isInline: true,
                    locationType: action.removeResourceSourceType,
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
    showActionText,
    canPlayInSpiteOfUI,
}: {
    card: CardModel;
    cardContext: CardContext;
    cardOwner?: PlayerState;
    showActionText?: boolean;
    canPlayInSpiteOfUI?: boolean;
}) => {
    if (!card.action) {
        return null;
    }

    const action = card.action;
    const actions = [...(action.choice ? action.choice : [action])];
    return (
        <ActionsWrapper>
            {showActionText && (
                <ActionText>
                    <span style={{fontWeight: 600}}>Action: </span>
                    <span>{action.text}</span>
                </ActionText>
            )}

            {actions.map((action, index) => {
                return (
                    <React.Fragment key={card.name + '-action-' + index}>
                        {index > 0 && (
                            <Box margin="4px 0">
                                <TextWithMargin>OR</TextWithMargin>
                            </Box>
                        )}
                        <CardAction
                            action={action}
                            card={card}
                            cardContext={cardContext}
                            cardOwner={cardOwner}
                            canPlayInSpiteOfUI={canPlayInSpiteOfUI}
                        />
                    </React.Fragment>
                );
            })}
        </ActionsWrapper>
    );
};

export function renderArrow() {
    return <TextWithMargin>➡</TextWithMargin>;
}

function CardAction({
    action,
    card,
    cardContext,
    cardOwner,
    canPlayInSpiteOfUI,
}: {
    action: Action;
    card: CardModel;
    cardContext: CardContext;
    cardOwner: SerializedPlayerState | undefined;
    canPlayInSpiteOfUI?: boolean;
}) {
    const apiClient = useApiClient();
    const loggedInPlayer = useLoggedInPlayer();
    const actionGuard = useActionGuard(cardOwner?.username ?? loggedInPlayer.username);

    const isOwnedByLoggedInPlayer =
        (cardOwner && cardOwner.index === loggedInPlayer.index) ?? false;

    let canPlay: boolean;

    if (canPlayInSpiteOfUI) {
        [canPlay] = actionGuard.canPlayCardActionInSpiteOfUI(action, card, cardOwner);
    } else {
        [canPlay] = actionGuard.canPlayCardAction(action, card, cardOwner);
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

    return (
        <ActionContainer
            cardContext={cardContext}
            action={action}
            playAction={playAction}
            playActionWithSupplementalResources={playActionWithSupplementalResources}
            canPlay={canPlay && isOwnedByLoggedInPlayer}
            loggedInPlayer={loggedInPlayer}
            isOwnedByLoggedInPlayer={isOwnedByLoggedInPlayer}
        >
            <Flex alignItems="center" justifyContent="center">
                {renderLeftSideOfArrow(action)}
                {renderArrow()}
                {renderRightSideOfArrow(
                    action,
                    card.storedResourceType,
                    cardContext !== CardContext.PLAYED_CARD
                )}
            </Flex>
        </ActionContainer>
    );
}

function ActionContainer({
    cardContext,
    action,
    playAction,
    playActionWithSupplementalResources,
    canPlay,
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
        const useStoredResourcesAsHeatCard = getUseStoredResourcesAsHeatCard(loggedInPlayer);
        if (useStoredResourcesAsHeatCard) {
            const resource = useStoredResourcesAsHeatCard.storedResourceType;
            const quantity = useStoredResourcesAsHeatCard.storedResourceAmount;
            if (resource && quantity) {
                return (
                    <HeatPaymentPopover
                        cost={heatCost as number}
                        useStoredResourcesAsHeatCard={useStoredResourcesAsHeatCard}
                        onConfirmPayment={payment =>
                            playActionWithSupplementalResources(action, {
                                name: useStoredResourcesAsHeatCard.name,
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

    return (
        <ActionContainerBase disabled={!canPlay || !playedCard} onClick={() => playAction(action)}>
            {children}
        </ActionContainerBase>
    );
}
