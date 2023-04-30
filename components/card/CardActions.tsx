import {Box, Flex} from 'components/box';
import {CardContext} from 'components/card/Card';
import {
    Colon,
    GainResourceIconography,
    GainResourceOptionIconography,
    IncreaseParameterIconography,
    IncreaseTerraformRatingIconography,
    InlineText,
    ProductionIconography,
    RemoveResourceIconography,
    RemoveResourceOptionIconography,
    StealResourceIconography,
    TextWithMargin,
} from 'components/card/CardIconography';
import {CardText} from 'components/card/CardText';
import {MiniDelegateComponent} from 'components/delegate';
import {InfluenceIcon, TerraformRatingIcon} from 'components/icons/other';
import {ResourceIcon} from 'components/icons/resource';
import {TileIcon} from 'components/icons/tile';
import {usePaymentPopover} from 'components/popovers/payment-popover';
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
import {SupplementalResources} from 'server/api-action-handler';
import {SerializedPlayerState} from 'state-serialization';
import styled from 'styled-components';
import {ActionContainerBase} from './ActionContainerBase';

const ActionText = styled(CardText)``;

const ActionsWrapper = styled.div`
    display: flex;
    position: relative;
    margin: 4px;
    align-items: center;
    justify-content: center;
    flex-direction: column;
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
                        [Resource.ANY_STANDARD_RESOURCE]:
                            action.increaseLowestProduction,
                    },
                }}
            />
        );
    }
    if (action.gainStandardResources) {
        elements.push(
            <GainResourceOptionIconography
                gainResourceOption={{
                    [Resource.MEGACREDIT]: 1,
                    [Resource.STEEL]: 1,
                    [Resource.TITANIUM]: 1,
                    [Resource.PLANT]: 1,
                    [Resource.ENERGY]: 1,
                    [Resource.HEAT]: 1,
                }}
            />
        );
        elements.push(<TextWithMargin>/</TextWithMargin>);
        elements.push(<InfluenceIcon />);
    }
    if (action.increaseParameter) {
        elements.push(
            <IncreaseParameterIconography
                increaseParameter={action.increaseParameter}
            />
        );
    }
    if (action.useBlueCardActionAlreadyUsedThisGeneration) {
        elements.push(
            <InlineText style={{color: colors.TEXT_DARK_1}}>
                {renderArrow()}
            </InlineText>
        );
    }
    if (action.gainResource) {
        // if this action also has a remove, lets explicitly mark the gain with a +
        const shouldShowPlus =
            Object.keys(action?.removeResource ?? {}).length > 0 &&
            shouldShowPlusAllowed;

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
    if (action.gainResourcesIfNotTerraformedThisGeneration) {
        // if this action also has a remove, lets explicitly mark the gain with a +
        const shouldShowPlus =
            Object.keys(action?.removeResource ?? {}).length > 0 &&
            shouldShowPlusAllowed;

        elements.push(
            <React.Fragment>
                <IncreaseTerraformRatingIconography
                    red={true}
                    increaseTerraformRating={1}
                />
                <Colon />
                <GainResourceIconography
                    gainResource={
                        action.gainResourcesIfNotTerraformedThisGeneration
                    }
                    opts={{
                        isInline: true,
                        shouldShowPlus,
                    }}
                    resourceOnCard={storedResourceType}
                />
            </React.Fragment>
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
    if (action.removeTile) {
        elements.push(
            <TileIcon type={action.removeTile} size={24} showRedBorder={true} />
        );
    }
    if (action.lookAtCards) {
        elements.push(<LookAtCards text={action.text ?? 'Look at cards'} />);
    }

    if (action.placeDelegatesInOneParty) {
        for (let i = 0; i < action.placeDelegatesInOneParty; i++) {
            elements.push(
                <Box marginRight="6px" marginBottom="4px">
                    <MiniDelegateComponent />
                </Box>
            );
        }
    }

    if (elements.length === 1) {
        return elements[0];
    }

    return (
        <Flex flexWrap="wrap" justifyContent="center" alignItems="center">
            {elements.map((element, index) => (
                <Box key={index}>{element}</Box>
            ))}
        </Flex>
    );
}

export function renderLeftSideOfArrow(action: Action) {
    const elements: Array<React.ReactNode> = [];
    if (action.cost) {
        elements.push(
            <div style={{display: 'inline-flex', alignItems: 'center'}}>
                <ResourceIcon
                    name={Resource.MEGACREDIT}
                    amount={`${action.cost}`}
                />
                {action.acceptedPayment && (
                    <span style={{marginLeft: 2}}>*</span>
                )}
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
            <ProductionIconography
                card={{decreaseProduction: action.decreaseProduction}}
            />
        );
    }
    return elements.map((element, i) => (
        <React.Fragment key={i}>{element}</React.Fragment>
    ));
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
                <ActionText className="mb-1">
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
    const actionGuard = useActionGuard(
        cardOwner?.username ?? loggedInPlayer.username
    );

    const isOwnedByLoggedInPlayer =
        (cardOwner && cardOwner.index === loggedInPlayer.index) ?? false;

    let canPlay: boolean;

    if (canPlayInSpiteOfUI) {
        [canPlay] = actionGuard.canPlayCardActionInSpiteOfUI(
            action,
            card,
            cardOwner
        );
    } else {
        [canPlay] = actionGuard.canPlayCardAction(action, card, cardOwner);
    }

    function playAction(action: Action, payment?: PropertyCounter<Resource>) {
        if (cardContext !== CardContext.PLAYED_CARD) {
            return;
        }
        if (card.action?.choice) {
            const choiceIndex = card.action.choice.indexOf(action);
            return apiClient.playCardActionAsync({
                parent: card,
                choiceIndex,
                payment,
            });
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
            playActionWithSupplementalResources={
                playActionWithSupplementalResources
            }
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
    canPlay,
    isOwnedByLoggedInPlayer,
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
    const isPlayedCard = cardContext === CardContext.PLAYED_CARD;
    const {onPaymentButtonClick, renderPaymentButton} =
        usePaymentPopover<HTMLButtonElement>({
            onConfirmPayment: payment => {
                playAction(action, payment);
            },
            opts: {
                type: 'action',
                action,
                cost: action.cost,
            },
        });

    const shouldDisable = !canPlay || !isPlayedCard || !isOwnedByLoggedInPlayer;
    return (
        <React.Fragment>
            {renderPaymentButton(
                <ActionContainerBase
                    disabled={shouldDisable}
                    onClick={onPaymentButtonClick}
                >
                    {children}
                </ActionContainerBase>
            )}
        </React.Fragment>
    );
}
