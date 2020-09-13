import {
    decreaseProduction,
    gainResource,
    gainStorableResource,
    increaseProduction,
    removeResource,
    removeStorableResource,
    stealResource,
    stealStorableResource,
} from 'actions';
import {
    getResourceName,
    isStorableResource,
    PROTECTED_HABITAT_RESOURCE,
    Resource,
    ResourceAndAmount,
    ResourceLocationType,
} from 'constants/resource';
import {Tag} from 'constants/tag';
import {VariableAmount} from 'constants/variable-amount';
import {AppContext} from 'context/app-context';
import {Card} from 'models/card';
import {useContext, useState} from 'react';
import {useDispatch, useStore} from 'react-redux';
import {GameState, PlayerState} from 'reducer';
import {getAdjacentCellsForCell} from 'selectors/board';
import styled from 'styled-components';
import spawnExhaustiveSwitchError from 'utils';
import {AskUserToMakeChoice, OptionsParent} from './ask-user-to-make-choice';
import React from 'react';

export type ResourceActionType =
    | 'removeResource'
    | 'gainResource'
    | 'stealResource'
    | 'increaseProduction'
    | 'decreaseProduction';

type PlayerOptionWrapper = {
    title: string;
    options: ResourceActionOption[];
    player: PlayerState;
};

type Props = {
    player: PlayerState;
    resourceActionDetails: {
        actionType: ResourceActionType;
        resourceAndAmounts: ResourceAndAmount[];
        card: Card;
        playedCard?: Card;
        locationType?: ResourceLocationType;
    };
};

function getPlayersToConsider(
    player: PlayerState,
    players: PlayerState[],
    locationType: ResourceLocationType | undefined,
    actionType: ResourceActionType,
    state: GameState
): PlayerState[] {
    if (actionType === 'increaseProduction') {
        return [player];
    }
    if (actionType === 'stealResource') {
        return players;
    }
    if (!locationType) {
        return [player];
    }
    switch (locationType) {
        case ResourceLocationType.THIS_CARD:
        case ResourceLocationType.ANY_CARD_OWNED_BY_YOU:
        case ResourceLocationType.LAST_PLAYED_CARD:
        case ResourceLocationType.ANY_CARD_WITH_NONZERO_STORABLE_RESOURCE:
            return [player];
        case ResourceLocationType.VENUS_CARD:
        case ResourceLocationType.JOVIAN_CARD:
            // Turns out both of these only add resources.
            return [player];
        case ResourceLocationType.ANY_CARD:
        case ResourceLocationType.ANY_PLAYER:
            return players;
        case ResourceLocationType.ANY_PLAYER_WITH_TILE_ADJACENT_TO_MOST_RECENTLY_PLACED_TILE:
            const neighbors = getAdjacentCellsForCell(
                state,
                state.common.mostRecentTilePlacementCell!
            );
            const playerIndices = neighbors.map(cell => cell?.tile?.ownerPlayerIndex);
            return players.filter(player => playerIndices.includes(player.index));
        case ResourceLocationType.ANY_PLAYER_WITH_VENUS_TAG:
            return players.filter(
                player =>
                    !!player.playedCards.flatMap(card => card.tags).find(tag => tag === Tag.VENUS)
            );
        default:
            throw spawnExhaustiveSwitchError(locationType);
    }
}

export type ResourceActionOption = {
    location: PlayerState | Card;
    quantity: number;
    resource: Resource;
    isVariable: boolean;
    actionType: ResourceActionType;
    card?: Card;
    text: string;
};

function getOptions(
    actionType: ResourceActionType,
    resourceAndAmount: ResourceAndAmount,
    card: Card,
    player: PlayerState,
    locationType: ResourceLocationType | undefined
): ResourceActionOption[] {
    if (actionType === 'decreaseProduction') {
        return getOptionsForDecreaseProduction(resourceAndAmount, player);
    } else if (actionType === 'increaseProduction') {
        return getOptionsForIncreaseProduction(resourceAndAmount, player);
    } else if (isStorableResource(resourceAndAmount.resource)) {
        return getOptionsForStorableResource(
            actionType,
            resourceAndAmount,
            card,
            player,
            locationType
        );
    } else {
        return getOptionsForRegularResource(actionType, resourceAndAmount, player);
    }
}

function getOptionsForIncreaseProduction(
    productionAndAmount: ResourceAndAmount,
    player: PlayerState
): ResourceActionOption[] {
    const {amount, resource} = productionAndAmount;
    const quantity = amount as number;
    const text = formatText(quantity, resource, 'increaseProduction');

    return [
        {
            location: player,
            quantity,
            resource,
            isVariable: false,
            actionType: 'increaseProduction',
            text,
        },
    ];
}

function getOptionsForDecreaseProduction(
    productionAndAmount: ResourceAndAmount,
    player: PlayerState
): ResourceActionOption[] {
    const {amount, resource} = productionAndAmount;
    let maxAmount: number;

    if (amount === VariableAmount.USER_CHOICE_MIN_ZERO) {
        // insulation-specific
        maxAmount = player.productions[resource];
    } else {
        maxAmount = Math.min(player.productions[resource], amount as number);
    }

    const isVariable = amount === VariableAmount.USER_CHOICE_MIN_ZERO;

    const text = formatText(maxAmount, resource, 'decreaseProduction');

    return [
        {
            location: player,
            quantity: maxAmount,
            resource,
            isVariable,
            actionType: 'decreaseProduction',
            text,
        },
    ];
}

function getOptionsForStorableResource(
    actionType: ResourceActionType,
    resourceAndAmount: ResourceAndAmount,
    originalCard: Card,
    player: PlayerState,
    locationType: ResourceLocationType | undefined
): ResourceActionOption[] {
    let {playedCards: cards} = player;
    const {resource, amount} = resourceAndAmount;
    const isVariable = amount === VariableAmount.USER_CHOICE;

    if (actionType === 'removeResource' || actionType === 'stealResource') {
        cards = cards.filter(card => (card.storedResourceAmount || 0) > 0);
    }

    cards = cards.filter(card => card.storedResourceType === resourceAndAmount.resource);

    switch (locationType) {
        case ResourceLocationType.THIS_CARD:
            cards = [originalCard];
            break;
        case ResourceLocationType.LAST_PLAYED_CARD: {
            // don't use the filtered list, because it's explicitly the last card played
            const lastPlayedCard = player.playedCards[player.playedCards.length - 1];
            cards = [];
            if (lastPlayedCard.storedResourceType === resourceAndAmount.resource) {
                cards = [lastPlayedCard];
            }
            break;
        }
        case ResourceLocationType.VENUS_CARD:
            cards = cards.filter(card => card.tags.includes(Tag.VENUS));
            break;
        case ResourceLocationType.JOVIAN_CARD:
            cards = cards.filter(card => card.tags.includes(Tag.JOVIAN));
            break;
        case ResourceLocationType.ANY_CARD_WITH_NONZERO_STORABLE_RESOURCE:
            cards = cards.filter(
                card =>
                    card.storedResourceType &&
                    card.storedResourceAmount !== undefined &&
                    card.storedResourceAmount > 0
            );
            break;
        case ResourceLocationType.ANY_CARD_OWNED_BY_YOU:
            cards = cards.filter(
                card => card.storedResourceType && card.storedResourceType === resource
            );
            break;
        default:
            break;
    }

    return cards.map(card => {
        let maxAmount: number;
        if (actionType === 'gainResource') {
            maxAmount = amount as number;
        } else {
            if (isVariable) {
                maxAmount = card.storedResourceAmount || 0;
            } else {
                maxAmount = Math.min(card.storedResourceAmount || 0, amount as number);
            }
        }

        const text = formatText(maxAmount, resource, actionType, card.name);

        return {
            location: card,
            resource,
            quantity: maxAmount,
            isVariable,
            actionType,
            card: originalCard,
            text,
        };
    });
}

function formatText(
    quantity: number,
    resource: Resource,
    actionType: ResourceActionType,
    locationName?: string
) {
    if (actionType === 'decreaseProduction' || actionType === 'increaseProduction') {
        return formatProductionText(actionType, quantity, resource);
    }
    const modifier = actionType === 'gainResource' ? 'to' : 'from';

    const locationAppendix = locationName ? `${modifier} ${locationName}` : '';

    const verb = {
        gainResource: 'Add',
        removeResource: 'Remove',
        stealResource: 'Steal',
    }[actionType];

    return `${verb} ${amountAndResource(quantity, resource)} ${locationAppendix}`;
}

function formatProductionText(
    actionType: ResourceActionType,
    quantity: number,
    resource: Resource
) {
    const verb = actionType === 'decreaseProduction' ? 'Decrease' : 'Increase';
    return `${verb} ${getResourceName(resource)} production ${quantity} step${
        quantity === 1 ? '' : 's'
    }`;
}

function getOptionsForRegularResource(
    actionType: ResourceActionType,
    resourceAndAmount: ResourceAndAmount,
    player: PlayerState
): ResourceActionOption[] {
    const {amount, resource} = resourceAndAmount;
    let maxAmount: number;
    if (actionType === 'gainResource') {
        maxAmount = amount as number;
    } else {
        if (amount === VariableAmount.USER_CHOICE) {
            maxAmount = player.resources[resource];
        } else {
            maxAmount = Math.min(player.resources[resource], amount as number);
        }
    }

    const isVariable = amount === VariableAmount.USER_CHOICE;

    const text = formatText(maxAmount, resource, actionType);

    return [
        {
            location: player,
            quantity: maxAmount,
            resource,
            isVariable,
            actionType,
            text,
        },
    ];
}

export function amountAndResource(quantity: number, resource: Resource) {
    const isPluralizable =
        resource !== Resource.HEAT &&
        resource !== Resource.ENERGY &&
        resource !== Resource.STEEL &&
        resource !== Resource.TITANIUM;
    return `${quantity} ${getResourceName(resource)}${isPluralizable && quantity !== 1 ? 's' : ''}`;
}

function AskUserToConfirmResourceActionDetails({
    player,
    resourceActionDetails: {actionType, resourceAndAmounts, card, playedCard, locationType},
}: Props) {
    const store = useStore();
    const state = store.getState();
    const players = state.players;

    let playersToConsider = getPlayersToConsider(player, players, locationType, actionType, state);

    playersToConsider = [...playersToConsider].sort((alpha, beta) => {
        if (actionType !== 'gainResource') {
            if (alpha.username === player.username) {
                return 1;
            }

            if (beta.username === player.username) {
                return -1;
            }
        }

        return alpha.username.toLowerCase() < beta.username.toLowerCase() ? -1 : 1;
    });

    const playerOptionWrappers: PlayerOptionWrapper[] = [];

    for (const playerToConsider of playersToConsider) {
        const playerOptionWrapper: PlayerOptionWrapper = {
            title: `${playerToConsider.corporation.name} (${playerToConsider.username})`,
            options: [],
            player: playerToConsider,
        };
        for (const resourceAndAmount of resourceAndAmounts) {
            if (actionType !== 'gainResource') {
                if (playerToConsider.playedCards.find(card => card.name === 'Protected Habitats')) {
                    if (PROTECTED_HABITAT_RESOURCE.includes(resourceAndAmount.resource)) {
                        if (playerToConsider.username !== player.username) {
                            continue;
                        }
                    }
                }
            }

            let options = getOptions(
                actionType,
                resourceAndAmount,
                card,
                playerToConsider,
                locationType
            );

            if (actionType !== 'gainResource') {
                options = options.filter(option => {
                    if (!(option.location instanceof Card)) {
                        return true;
                    }

                    return option.location.name !== 'Pets';
                });
            }

            playerOptionWrapper.options.push(...options);
        }

        const zeroChangeAllowed = actionType === 'decreaseProduction';

        playerOptionWrapper.options = playerOptionWrapper.options.filter(
            option => option.quantity > 0 || zeroChangeAllowed
        );

        if (playerOptionWrapper.options.length > 0) {
            playerOptionWrappers.push(playerOptionWrapper);
        }
    }

    const context = useContext(AppContext);
    const dispatch = useDispatch();

    const handleSkip = () => {
        context.processQueue(dispatch);
    };

    const hasNoOptions = playerOptionWrappers.flatMap(item => item.options).length === 0;

    let shouldShowSkip =
        hasNoOptions ||
        (actionType !== 'stealResource' &&
            actionType !== 'decreaseProduction' &&
            actionType !== 'increaseProduction' &&
            (actionType === 'removeResource' ||
                resourceAndAmounts.every(resourceAndAmount =>
                    isStorableResource(resourceAndAmount.resource)
                )));

    const isNegativeAction = ['removeResource', 'decreaseProduction', 'stealResource'].includes(
        actionType
    );

    return (
        <AskUserToMakeChoice card={card} playedCard={playedCard}>
            {playerOptionWrappers.map(playerOptionWrapper => {
                const shouldShowWarningMessage =
                    !playerOptionWrapper.options.some(option => option.isVariable) &&
                    playerOptionWrapper.player === player &&
                    isNegativeAction;
                return (
                    <PlayerOption
                        showWarning={shouldShowWarningMessage}
                        key={playerOptionWrapper.player.username}
                    >
                        <h4>{playerOptionWrapper.title}</h4>
                        {shouldShowWarningMessage ? <Red>Warning: This is you!</Red> : null}
                        <OptionsParent>
                            {playerOptionWrapper.options.map(option => {
                                return <OptionComponent option={option} key={option.text} />;
                            })}
                        </OptionsParent>
                    </PlayerOption>
                );
            })}
            {shouldShowSkip && <button onClick={handleSkip}>Skip</button>}
        </AskUserToMakeChoice>
    );
}

function OptionComponent({option}: {option: ResourceActionOption}) {
    const dispatch = useDispatch();

    const context = useContext(AppContext);
    const store = useStore();
    const state = store.getState();
    const player = context.getLoggedInPlayer(state);

    function handleClick() {
        dispatch(getAction(option, player, variableAmount));
        context.processQueue(dispatch);
    }

    const max =
        option.actionType === 'decreaseProduction'
            ? player.productions[option.resource]
            : player.resources[option.resource];

    const [variableAmount, setVariableAmount] = useState(Math.min(1, max));

    if (option.isVariable && option.actionType === 'decreaseProduction') {
        // Currently this is just insulation
        return (
            <React.Fragment>
                Decrease {getResourceName(option.resource)} production by{' '}
                <input
                    type="number"
                    min={0}
                    value={variableAmount}
                    max={max}
                    onChange={e =>
                        setVariableAmount(Math.max(0, Math.min(max, Number(e.target.value))))
                    }
                />
                {variableAmount === 1 ? ' step' : ' steps'}
                <button onClick={handleClick} style={{display: 'inline-flex', marginLeft: 8}}>
                    Confirm
                </button>
            </React.Fragment>
        );
    } else if (option.isVariable) {
        return (
            <React.Fragment>
                Remove{' '}
                <input
                    type="number"
                    min={1}
                    value={variableAmount}
                    max={max}
                    onChange={e =>
                        setVariableAmount(Math.max(0, Math.min(max, Number(e.target.value))))
                    }
                />{' '}
                {getResourceName(option.resource)}
                <button onClick={handleClick} style={{display: 'inline-flex', marginLeft: 8}}>
                    Confirm
                </button>
            </React.Fragment>
        );
    } else {
        return <button onClick={handleClick}>{option.text}</button>;
    }
}

function getAction(option: ResourceActionOption, player: PlayerState, variableAmount: number) {
    const quantity = option.isVariable ? variableAmount : option.quantity;
    switch (option.actionType) {
        case 'removeResource':
            if (option.location instanceof Card) {
                // we know we're removing a stored resource.
                return removeStorableResource(
                    option.resource,
                    quantity,
                    player.index,
                    option.location
                );
            } else {
                return removeResource(
                    option.resource,
                    quantity,
                    option.location.index,
                    player.index
                );
            }
        case 'gainResource':
            if (option.location instanceof Card) {
                return gainStorableResource(
                    option.resource,
                    quantity,
                    option.location,
                    player.index
                );
            } else {
                return gainResource(option.resource, quantity, player.index);
            }
        case 'stealResource':
            if (option.location instanceof Card) {
                return stealStorableResource(
                    option.resource,
                    quantity,
                    player.index,
                    option.location,
                    option.card!
                );
            } else {
                return stealResource(
                    option.resource,
                    quantity,
                    player.index,
                    option.location.index
                );
            }
        case 'decreaseProduction':
            return decreaseProduction(
                option.resource,
                quantity,
                player.index,
                (option.location as PlayerState).index
            );
        case 'increaseProduction':
            return increaseProduction(option.resource, quantity, player.index);
        default:
            throw spawnExhaustiveSwitchError(option.actionType);
    }
}

const Red = styled.div`
    font-weight: bold;
    color: maroon;
    text-align: center;
    padding: 4px;
    border: 2px solid black;
`;

type WarningProp = {showWarning?: boolean};

const PlayerOption = styled.li<WarningProp>`
    display: block;
    padding: 8px;
    margin-bottom: 8px;
    border-radius: 3px;
    border: ${props => (props.showWarning ? '2px solid maroon' : '1px solid #ccc')};
`;

export default AskUserToConfirmResourceActionDetails;
