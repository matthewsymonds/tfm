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
    increaseParameter,
    increaseProduction,
    removeResource,
} from 'actions';
import {ApiClient} from 'api-client';
import {ActionGuard} from 'client-server-shared/action-guard';
import {Payment} from 'constants/action';
import {MinimumProductions} from 'constants/game';
import {Resource} from 'constants/resource-enum';
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
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
    ProductionIconography,
    RemoveResourceIconography,
} from './card/CardIconography';
import {TileIcon} from './icons/tile';
import PaymentPopover from './popovers/payment-popover';
import {colors} from './ui';

function createActionIcon(action: AnyAction) {
    if (increaseProduction.match(action)) {
        return (
            <ProductionIconography
                card={{increaseProduction: {[action.payload.resource]: action.payload.amount}}}
            />
        );
    } else if (decreaseProduction.match(action)) {
        return (
            <ProductionIconography
                card={{decreaseProduction: {[action.payload.resource]: action.payload.amount}}}
            />
        );
    } else if (gainResource.match(action)) {
        return (
            <GainResourceIconography
                gainResource={{[action.payload.resource]: action.payload.amount}}
            />
        );
    } else if (removeResource.match(action)) {
        return (
            <RemoveResourceIconography
                removeResource={{[action.payload.resource]: action.payload.amount}}
            />
        );
    } else if (increaseParameter.match(action)) {
        return (
            <BaseActionIconography
                card={{increaseParameter: {[action.payload.parameter]: action.payload.amount}}}
            />
        );
    } else if (addActionToPlay.match(action)) {
        return <BaseActionIconography card={action.payload.action} />;
    } else if (askUserToPlaceTile.match(action)) {
        return <TileIcon type={action.payload.tilePlacement.type} size={24} />;
    } else if (askUserToChooseResourceActionDetails.match(action)) {
        const resourceAndAmountEls = action.payload.resourceAndAmounts.map(
            (resourceAndAmount, index) => (
                <>
                    <BaseActionIconography
                        key={index}
                        card={{
                            [action.payload.actionType]: {
                                [resourceAndAmount.resource]: resourceAndAmount.amount,
                            },
                        }}
                    />
                    {index < action.payload.resourceAndAmounts.length - 1 ? <span> / </span> : null}
                </>
            )
        );
        return <div>{resourceAndAmountEls}</div>;
    } else if (askUserToLookAtCards.match(action)) {
        return <LookAtCards text={action.payload.text ?? 'Look at cards'} />;
    } else if (askUserToDiscardCards.match(action)) {
        return null;
    } else if (askUserToMakeActionChoice.match(action)) {
        return (
            <>
                {action.payload.choice.map((choice, index) => (
                    <BaseActionIconography card={choice} key={index} />
                ))}
            </>
        );
    } else if (askUserToDuplicateProduction.match(action)) {
        return <BaseActionIconography card={{duplicateProduction: action.payload.tag}} />;
    } else if (askUserToIncreaseLowestProduction.match(action)) {
        return <BaseActionIconography card={{increaseLowestProduction: action.payload.amount}} />;
    } else if (askUserToChoosePrelude.match(action)) {
        return <BaseActionIconography card={{choosePrelude: action.payload.amount}} />;
    } else if (askUserToFundAward.match(action)) {
        return <BaseActionIconography card={{fundAward: true}} />;
    } else if (askUserToPlaceColony.match(action)) {
        return <BaseActionIconography card={{placeColony: action.payload.placeColony}} />;
    } else if (askUserToPlayCardFromHand.match(action)) {
        const {discount, ignoreGlobalRequirements} = action.payload.playCardParams;
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
                card={{increaseAndDecreaseColonyTileTracks: action.payload.quantity}}
            />
        );
    } else if (askUserToTradeForFree.match(action)) {
        return <BaseActionIconography card={{tradeForFree: true}} />;
    } else if (askUserToPutAdditionalColonyTileIntoPlay.match(action)) {
        return <BaseActionIconography card={{putAdditionalColonyTileIntoPlay: true}} />;
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
        applyDiscounts.match(action)
    );
}

export function canPlayActionNext(
    action: AnyAction,
    state: GameState,
    player: PlayerState,
    hasUnpaidActions: boolean,
    actionGuard: ActionGuard
) {
    if (increaseProduction.match(action)) {
        return true;
    } else if (decreaseProduction.match(action)) {
        const {resource, amount, playerIndex, targetPlayerIndex} = action.payload;
        return (
            state.players[targetPlayerIndex].productions[resource] -
                convertAmountToNumber(amount, state, state.players[playerIndex]) >=
            MinimumProductions[resource]
        );
    } else if (gainResource.match(action)) {
        // User cannot draw cards while they have to resolve negative production/discard.
        return action.payload.resource !== Resource.CARD && hasUnpaidActions;
    } else if (removeResource.match(action)) {
        const {resource, amount, sourcePlayerIndex} = action.payload;
        const player = state.players[sourcePlayerIndex];
        return amount <= player.resources[resource];
    } else if (addActionToPlay.match(action)) {
        return actionGuard.canPlayActionInSpiteOfUI(action.payload.action, state);
    } else if (askUserToPlaceTile.match(action)) {
        return state.common.board
            .flat()
            .some(cell => actionGuard.canCompletePlaceTile(cell, action.payload.tilePlacement)[0]);
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

function getUniqueActions(actions: AnyAction[]) {
    let uniqueActions: Array<{action: AnyAction; index: number}> = [];

    for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        if (uniqueActions.every(uniqueAction => !naiveIsEqual(action, uniqueAction.action))) {
            uniqueActions.push({action, index: i});
        }
    }
    return uniqueActions;
}

export function AskUserToChooseNextAction({player}: {player: PlayerState}) {
    const actionGuard = useActionGuard();
    const state = useTypedSelector(state => state);
    const apiClient = useApiClient();
    const uniqueActions = getUniqueActions(player?.pendingNextActionChoice ?? []);

    const options: React.ReactNode[] = [];

    const actions = uniqueActions.map(({action}) => action);

    const hasUnpaidActions = hasUnpaidResources(actions, state, player);

    for (const uniqueAction of uniqueActions) {
        const {action, index} = uniqueAction;

        const actionElement = createActionIcon(action);
        if (!actionElement) continue;
        const canPlayAction = canPlayActionNext(
            action,
            state,
            player,
            hasUnpaidActions,
            actionGuard
        );

        const {payload} = action;

        const otherPlayerIndex =
            'sourcePlayerIndex' in payload
                ? payload.sourcePlayerIndex
                : 'targetPlayerIndex' in payload
                ? payload.targetPlayerIndex
                : action.playerIndex;
        let element = (
            <button
                style={{padding: '4px', height: '100%'}}
                disabled={!canPlayAction}
                onClick={() => handleChooseNextAction(apiClient, index)}
            >
                {actionElement}
            </button>
        );
        if (
            player.corporation.name === 'Helion' &&
            removeResource.match(action) &&
            action.payload.resource === Resource.MEGACREDIT
        ) {
            element = (
                <PaymentPopover
                    cost={action.payload.amount}
                    onConfirmPayment={payment => handleChooseNextAction(apiClient, index, payment)}
                    shouldHide={false}
                >
                    {element}
                </PaymentPopover>
            );
        }
        options.push(
            <Box margin="8px" key={index} height="100%">
                {element}
            </Box>
        );
    }

    return (
        <Box color={colors.TEXT_LIGHT_1}>
            <h3>Please choose the next effect:</h3>
            <Flex height="fit-content" alignItems="center" width="100%" flexWrap="wrap">
                {options}
                {hasUnpaidActions ? (
                    <div>
                        ...or, you may{' '}
                        <button onClick={() => handleStartOver(apiClient)}>start over</button>
                    </div>
                ) : null}
            </Flex>
        </Box>
    );
}
