import {
    addActionToPlay,
    addParameterRequirementAdjustments,
    applyDiscounts,
    askUserToChoosePrelude,
    askUserToChooseResourceActionDetails,
    askUserToDiscardCards,
    askUserToDuplicateProduction,
    askUserToFundAward,
    askUserToIncreaseAndDecreaseColonyTileTracks,
    askUserToIncreaseLowestProduction,
    askUserToLookAtCards,
    askUserToMakeActionChoice,
    askUserToPlaceColony,
    askUserToPlaceTile,
    askUserToPlayCardFromHand,
    askUserToPutAdditionalColonyTileIntoPlay,
    askUserToTradeForFree,
    completeAction,
    decreaseProduction,
    gainResource,
    gainStorableResource,
    increaseParameter,
    increaseProduction,
    increaseTerraformRating,
    markCardActionAsPlayed,
    placeTile,
    removeResource,
    removeStorableResource,
    setPreludes,
} from 'actions';
import {ApiClient} from 'api-client';
import {ActionGuard} from 'client-server-shared/action-guard';
import {Payment} from 'constants/action';
import {Parameter} from 'constants/board';
import {MinimumProductions} from 'constants/game';
import {Resource} from 'constants/resource-enum';
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import React from 'react';
import {GameState, PlayerState, useTypedSelector} from 'reducer';
import {AnyAction} from 'redux';
import {convertAmountToNumber} from 'selectors/convert-amount-to-number';
import {hasUnpaidResources} from 'server/api-action-handler';
import {Box, Flex} from './box';
import {LookAtCards} from './card/CardActions';
import {
    BaseActionIconography,
    GainResourceIconography,
    IncreaseTerraformRatingIconography,
    ProductionIconography,
    RemoveResourceIconography,
} from './card/CardIconography';
import {TileIcon} from './icons/tile';
import {colors} from './ui';

function createActionIcon(action: AnyAction) {
    if (increaseProduction.match(action)) {
        return (
            <ProductionIconography
                card={{
                    increaseProduction: {
                        [action.payload.resource]: action.payload.amount,
                    },
                }}
            />
        );
    } else if (decreaseProduction.match(action)) {
        return (
            <ProductionIconography
                card={{
                    decreaseProduction: {
                        [action.payload.resource]: action.payload.amount,
                    },
                }}
            />
        );
    } else if (gainResource.match(action)) {
        return (
            <GainResourceIconography
                gainResource={{
                    [action.payload.resource]: action.payload.amount,
                }}
            />
        );
    } else if (gainStorableResource.match(action)) {
        return (
            <Flex>
                <GainResourceIconography
                    gainResource={{
                        [action.payload.resource]: action.payload.amount,
                    }}
                />
                <Box marginLeft="4px">
                    <em>to {action.payload.card.name}</em>
                </Box>
            </Flex>
        );
    } else if (
        removeResource.match(action) ||
        removeStorableResource.match(action)
    ) {
        return (
            <RemoveResourceIconography
                removeResource={{
                    [action.payload.resource]: action.payload.amount,
                }}
            />
        );
    } else if (
        increaseParameter.match(action) &&
        action.payload.parameter !== Parameter.OCEAN
    ) {
        return (
            <BaseActionIconography
                card={{
                    increaseParameter: {
                        [action.payload.parameter]: action.payload.amount,
                    },
                }}
            />
        );
    } else if (increaseTerraformRating.match(action)) {
        return (
            <IncreaseTerraformRatingIconography
                increaseTerraformRating={action.payload.amount}
            />
        );
    } else if (addActionToPlay.match(action)) {
        return (
            <BaseActionIconography
                card={action.payload.action}
                reverse={action.payload.reverseOrder}
                inline
            />
        );
    } else if (askUserToPlaceTile.match(action)) {
        return <TileIcon type={action.payload.tilePlacement.type} size={24} />;
    } else if (placeTile.match(action)) {
        return <TileIcon type={action.payload.tile.type} size={24} />;
    } else if (askUserToChooseResourceActionDetails.match(action)) {
        const resourceAndAmountEls = action.payload.resourceAndAmounts.map(
            (resourceAndAmount, index) => (
                <React.Fragment key={index}>
                    <BaseActionIconography
                        card={{
                            [action.payload.actionType]: {
                                [resourceAndAmount.resource]:
                                    resourceAndAmount.amount,
                            },
                        }}
                    />
                    {index < action.payload.resourceAndAmounts.length - 1 ? (
                        <span> / </span>
                    ) : null}
                </React.Fragment>
            )
        );
        return <div>{resourceAndAmountEls}</div>;
    } else if (askUserToLookAtCards.match(action)) {
        return <LookAtCards text={action.payload.text ?? 'Look at cards'} />;
    } else if (askUserToDiscardCards.match(action)) {
        return (
            <BaseActionIconography
                card={{
                    removeResource: {[Resource.CARD]: action.payload.amount},
                }}
            />
        );
    } else if (askUserToMakeActionChoice.match(action)) {
        return (
            <>
                {action.payload.choice.map((choice, index) => (
                    <BaseActionIconography card={choice} key={index} />
                ))}
            </>
        );
    } else if (askUserToDuplicateProduction.match(action)) {
        return (
            <BaseActionIconography
                card={{duplicateProduction: action.payload.tag}}
            />
        );
    } else if (askUserToIncreaseLowestProduction.match(action)) {
        return (
            <BaseActionIconography
                card={{increaseLowestProduction: action.payload.amount}}
            />
        );
    } else if (askUserToChoosePrelude.match(action)) {
        return (
            <BaseActionIconography
                card={{choosePrelude: action.payload.amount}}
            />
        );
    } else if (askUserToFundAward.match(action)) {
        return <BaseActionIconography card={{fundAward: true}} />;
    } else if (askUserToPlaceColony.match(action)) {
        return (
            <BaseActionIconography
                card={{placeColony: action.payload.placeColony}}
            />
        );
    } else if (askUserToPlayCardFromHand.match(action)) {
        const {discount, ignoreGlobalRequirements} =
            action.payload.playCardParams;
        return (
            <div>
                Play card
                {discount
                    ? ' reducing cost by ' + discount + 'MC'
                    : ignoreGlobalRequirements
                    ? ' ignoring global requirements'
                    : ''}
                .
            </div>
        );
    } else if (askUserToIncreaseAndDecreaseColonyTileTracks.match(action)) {
        return (
            <BaseActionIconography
                card={{
                    increaseAndDecreaseColonyTileTracks:
                        action.payload.quantity,
                }}
            />
        );
    } else if (askUserToTradeForFree.match(action)) {
        return <BaseActionIconography card={{tradeForFree: true}} />;
    } else if (askUserToPutAdditionalColonyTileIntoPlay.match(action)) {
        return (
            <BaseActionIconography
                card={{putAdditionalColonyTileIntoPlay: true}}
            />
        );
    } else if (userCannotChooseAction(action)) {
        return null;
    } else {
        return <div>{JSON.stringify(action)}</div>;
    }
}

export function userCannotChooseAction(action: AnyAction): boolean {
    return (
        completeAction.match(action) ||
        addParameterRequirementAdjustments.match(action) ||
        applyDiscounts.match(action) ||
        setPreludes.match(action) ||
        (increaseParameter.match(action) &&
            action.payload.parameter === Parameter.OCEAN) ||
        markCardActionAsPlayed.match(action)
    );
}

export function canPlayActionNext(
    action: AnyAction,
    state: GameState,
    loggedInPlayerIndex: number,
    hasUnpaidActions: boolean,
    actionGuard: ActionGuard
) {
    if (
        loggedInPlayerIndex !==
        (state.common.controllingPlayerIndex ?? state.common.currentPlayerIndex)
    ) {
        return false;
    }

    if (increaseProduction.match(action)) {
        return true;
    } else if (decreaseProduction.match(action)) {
        const {resource, amount, playerIndex, targetPlayerIndex} =
            action.payload;
        return (
            state.players[targetPlayerIndex].productions[resource] -
                convertAmountToNumber(
                    amount,
                    state,
                    state.players[playerIndex]
                ) >=
            MinimumProductions[resource]
        );
    } else if (gainResource.match(action)) {
        // User cannot draw cards while they have to resolve negative production/discard.
        return action.payload.resource !== Resource.CARD || !hasUnpaidActions;
    } else if (removeResource.match(action)) {
        const {resource, amount, sourcePlayerIndex} = action.payload;
        const player = state.players[sourcePlayerIndex];
        return amount <= player.resources[resource];
    } else if (addActionToPlay.match(action)) {
        return actionGuard.canPlayActionInSpiteOfUI(
            action.payload.action,
            state
        )[0];
    } else if (askUserToPlaceTile.match(action)) {
        return state.common.board
            .flat()
            .some(
                cell =>
                    actionGuard.canCompletePlaceTile(
                        cell,
                        action.payload.tilePlacement
                    )[0]
            );
    } else {
        // TODO fill in more actions.
        return true;
    }
}

async function handleChooseNextAction(
    apiClient: ApiClient,
    actionIndex: number,
    payment?: Payment
) {
    await apiClient.completeChooseNextActionAsync(actionIndex, payment);
}

async function handleStartOver(apiClient: ApiClient) {
    await apiClient.startOverAsync();
}

//
function naiveIsEqual(a: Object, b: Object) {
    if (a === b) {
        return true;
    }

    try {
        const aJSON = JSON.stringify(a);
        const bJSON = JSON.stringify(b);
        return aJSON === bJSON;
    } catch (error) {
        return false;
    }
}

export function getPlayerIndex(action: AnyAction) {
    const {payload} = action;
    return 'sourcePlayerIndex' in payload
        ? payload.sourcePlayerIndex
        : 'targetPlayerIndex' in payload
        ? payload.targetPlayerIndex
        : payload.playerIndex;
}

function getElement(
    actions: AnyAction[],
    index: number,
    player: PlayerState,
    state: GameState,
    hasUnpaidActions: boolean,
    actionGuard: ActionGuard,
    apiClient: ApiClient,
    loggedInPlayerIndex: number
): [React.ReactNode, boolean] {
    const playerIndex = player.index;
    const action = actions[index];
    if (!action) return [null, false];
    if (getPlayerIndex(action) !== playerIndex) return [null, false];

    const actionElement = createActionIcon(action);
    if (!actionElement) return [null, false];
    const canPlayAction = canPlayActionNext(
        action,
        state,
        loggedInPlayerIndex,
        hasUnpaidActions,
        actionGuard
    );

    const isDisabled = !canPlayAction;

    let element = (
        <button
            style={{padding: '4px', height: '100%'}}
            disabled={!canPlayAction}
            onClick={() => handleChooseNextAction(apiClient, index)}
        >
            {actionElement}
        </button>
    );

    element = (
        <Box margin="8px" key={index} height="100%">
            {element}
        </Box>
    );

    return [element, isDisabled];
}

export function AskUserToChooseNextAction({player}: {player: PlayerState}) {
    const actionGuard = useActionGuard();
    const state = useTypedSelector(state => state);
    const loggedInPlayer = useLoggedInPlayer();
    const apiClient = useApiClient();
    const actions = player?.pendingNextActionChoice ?? [];

    const unusedActions = actions
        .filter(Boolean)
        .filter(action => !!createActionIcon(action));

    const hasUnpaidActions = useTypedSelector(state =>
        hasUnpaidResources(unusedActions, state, player, actionGuard)
    );

    let hasDisabledAction = false;

    const playerIndices = useTypedSelector(state =>
        state.players.map(player => player.index)
    ).filter(playerIndex =>
        unusedActions.some(action => getPlayerIndex(action) === playerIndex)
    );

    const playerElements: React.ReactNode[] = [];

    for (const playerIndex of playerIndices) {
        const player = state.players[playerIndex];
        let elements: React.ReactNode[] = [];
        for (let i = 0; i < actions.length; i++) {
            const [element, isDisabled] = getElement(
                actions,
                i,
                player,
                state,
                hasUnpaidActions,
                actionGuard,
                apiClient,
                loggedInPlayer.index
            );
            if (element) {
                elements.push(
                    <Box margin="8px" height="100%" key={i}>
                        <button
                            style={{padding: '4px', height: '100%'}}
                            disabled={isDisabled}
                            onClick={() => handleChooseNextAction(apiClient, i)}
                        >
                            {createActionIcon(actions[i])}
                        </button>
                    </Box>
                );
                if (isDisabled) {
                    hasDisabledAction = true;
                }
            }
        }
        const playerElement = (
            <Box key={playerIndex} padding={'4px'}>
                {playerIndices.length === 1 &&
                playerIndices[0] === player.index ? null : (
                    <em>{state.players[playerIndex].corporation.name}:</em>
                )}
                <Flex>{elements}</Flex>
            </Box>
        );
        playerElements.push(playerElement);
    }

    const isLoggedInPlayersTurn = useTypedSelector(
        state =>
            (state.common.controllingPlayerIndex ??
                state.common.currentPlayerIndex) === loggedInPlayer.index
    );

    return (
        <Box color={colors.TEXT_LIGHT_1}>
            <h3>
                {isLoggedInPlayersTurn
                    ? 'Please choose the next effect:'
                    : 'Please wait...'}
            </h3>
            <Box
                height="fit-content"
                alignItems="center"
                width="100%"
                flexWrap="wrap"
            >
                {playerElements}
                {hasDisabledAction && isLoggedInPlayersTurn ? (
                    <div>
                        ...or, you may{' '}
                        <button onClick={() => handleStartOver(apiClient)}>
                            start over
                        </button>
                    </div>
                ) : null}
            </Box>
        </Box>
    );
}
