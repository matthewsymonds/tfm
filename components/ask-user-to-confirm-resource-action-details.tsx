import {useContext} from 'react';
import {useDispatch, useStore} from 'react-redux';
import styled from 'styled-components';
import {
    completeAction,
    gainResource,
    gainStorableResource,
    removeResource,
    removeStorableResource,
    stealResource,
    stealStorableResource,
} from 'actions';
import {
    getResourceName,
    isStorableResource,
    Resource,
    ResourceAndAmount,
    ResourceLocationType,
    PROTECTED_HABITAT_RESOURCE,
} from 'constants/resource';
import {Tag} from 'constants/tag';
import {VariableAmount} from 'constants/variable-amount';
import {AppContext} from 'context/app-context';
import {Card} from 'models/card';
import {PlayerState} from 'reducer';
import spawnExhaustiveSwitchError from 'utils';
import {CardComponent} from './card';
import {Box, Flex} from './box';

type ActionType = 'removeResource' | 'gainResource' | 'stealResource';
type ListItem = {
    title: string;
    options: Option[];
    player: PlayerState;
};
type Props = {
    player: PlayerState;
    resourceActionDetails: {
        actionType: ActionType;
        resourceAndAmounts: ResourceAndAmount[];
        card: Card;
        locationType?: ResourceLocationType;
    };
};

function getPlayersToConsider(
    player: PlayerState,
    players: PlayerState[],
    locationType: ResourceLocationType | undefined,
    actionType: ActionType
): PlayerState[] {
    if (actionType === 'stealResource') {
        return players;
    }
    if (!locationType) {
        return [player];
    }
    switch (locationType) {
        case ResourceLocationType.THIS_CARD:
            return [player];
        case ResourceLocationType.ANY_CARD_OWNED_BY_YOU:
            return [player];
        case ResourceLocationType.ANY_CARD:
            return players;
        case ResourceLocationType.ANY_PLAYER:
            return players;
        case ResourceLocationType.ANY_PLAYER_WITH_VENUS_TAG:
            return players.filter(
                player =>
                    !!player.playedCards.flatMap(card => card.tags).find(tag => tag === Tag.VENUS)
            );
        case ResourceLocationType.LAST_PLAYED_CARD:
            return [player];
        case ResourceLocationType.VENUS_CARD:
        case ResourceLocationType.JOVIAN_CARD:
            // Turns out both of these only add resources.
            return [player];
        default:
            throw spawnExhaustiveSwitchError(locationType);
    }
}

type Option = {
    location: PlayerState | Card;
    quantity: number;
    resource: Resource;
    isVariable: boolean;
    actionType: ActionType;
    card?: Card;
    text: string;
};

function getOptions(
    actionType: ActionType,
    resourceAndAmount: ResourceAndAmount,
    card: Card,
    player: PlayerState,
    locationType: ResourceLocationType | undefined
): Option[] {
    if (
        (locationType || actionType === 'stealResource') &&
        isStorableResource(resourceAndAmount.resource)
    ) {
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

function getOptionsForStorableResource(
    actionType: ActionType,
    resourceAndAmount: ResourceAndAmount,
    originalCard: Card,
    player: PlayerState,
    locationType: ResourceLocationType | undefined
): Option[] {
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
        case ResourceLocationType.LAST_PLAYED_CARD:
            cards = [cards[cards.length - 1]];
            break;
        case ResourceLocationType.VENUS_CARD:
            cards = cards.filter(card => card.tags.includes(Tag.VENUS));
            break;
        case ResourceLocationType.JOVIAN_CARD:
            cards = cards.filter(card => card.tags.includes(Tag.JOVIAN));
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

        const text = formatText(maxAmount, resource, isVariable, actionType, card.name);

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
    userChoice: boolean,
    actionType: ActionType,
    locationName?: string
) {
    const modifier = actionType === 'gainResource' ? 'to' : 'from';

    const locationAppendix = locationName ? `${modifier} ${locationName}` : '';

    const prefix = userChoice ? 'up to ' : '';

    const verb = {
        gainResource: 'Add',
        removeResource: 'Remove',
        stealResource: 'Steal',
    }[actionType];

    return `${verb} ${prefix} ${amountAndResource(quantity, resource)} ${locationAppendix}`;
}

function getOptionsForRegularResource(
    actionType: ActionType,
    resourceAndAmount: ResourceAndAmount,
    player: PlayerState
): Option[] {
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

    const text = formatText(maxAmount, resource, isVariable, actionType);

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

function amountAndResource(quantity: number, resource: Resource) {
    const isPluralizable =
        resource !== Resource.HEAT &&
        resource !== Resource.ENERGY &&
        resource !== Resource.STEEL &&
        resource !== Resource.TITANIUM;
    return `${quantity} ${getResourceName(resource)}${isPluralizable && quantity !== 1 ? 's' : ''}`;
}

function AskUserToConfirmResourceActionDetails({
    player,
    resourceActionDetails: {actionType, resourceAndAmounts, card, locationType},
}: Props) {
    const store = useStore();
    const state = store.getState();
    const players = state.players;

    let playersToConsider = getPlayersToConsider(player, players, locationType, actionType);

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

    const listItems: ListItem[] = [];

    for (const playerToConsider of playersToConsider) {
        const listItem: ListItem = {
            title: `${playerToConsider.corporation?.name} (${playerToConsider.username})`,
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

            listItem.options.push(...options);
        }

        listItem.options = listItem.options.filter(option => option.quantity > 0);

        if (listItem.options.length > 0) {
            listItems.push(listItem);
        }
    }
    debugger;
    return (
        <Flex width="100%" justifyContent="center">
            <Box marginRight="32px">
                <h3>You played</h3>
                <CardComponent content={card} />
            </Box>

            <OptionsParent>
                <h3>Please choose from the following:</h3>
                {listItems.map(listItem => {
                    const warning = listItem.player === player && actionType === 'removeResource';
                    return (
                        <PlayerOption warning={warning} key={listItem.player.username}>
                            <h4>{listItem.title}</h4>
                            {warning ? <Red>Warning: This is you!</Red> : null}
                            <OptionsParent>
                                {listItem.options.map(childItem => {
                                    return (
                                        <OptionComponent
                                            {...childItem}
                                            key={childItem.text}
                                        ></OptionComponent>
                                    );
                                })}
                            </OptionsParent>
                        </PlayerOption>
                    );
                })}
            </OptionsParent>
        </Flex>
    );
}

function OptionComponent(props: Option) {
    const dispatch = useDispatch();

    const context = useContext(AppContext);
    const store = useStore();
    const state = store.getState();
    const player = context.getLoggedInPlayer(state);

    function handleClick() {
        context.queue.push(getAction(props, player));
        context.queue.push(completeAction(player.index));
        context.processQueue(dispatch);
    }

    return <OptionsComponentBase onClick={handleClick}>{props.text}</OptionsComponentBase>;
}

function getAction(option: Option, player: PlayerState) {
    switch (option.actionType) {
        case 'removeResource':
            if (option.location instanceof Card) {
                // we know we're removing a stored resource.
                return removeStorableResource(
                    option.resource,
                    option.quantity,
                    player.index,
                    option.location
                );
            } else {
                return removeResource(
                    option.resource,
                    option.quantity,
                    option.location.index,
                    player.index
                );
            }
        case 'gainResource':
            if (option.location instanceof Card) {
                return gainStorableResource(
                    option.resource,
                    option.quantity,
                    option.location,
                    player.index
                );
            } else {
                return gainResource(option.resource, option.quantity, player.index);
            }
        case 'stealResource':
            if (option.location instanceof Card) {
                return stealStorableResource(
                    option.resource,
                    option.quantity,
                    player.index,
                    option.location,
                    option.card!
                );
            } else {
                return stealResource(
                    option.resource,
                    option.quantity,
                    player.index,
                    option.location.index
                );
            }
        default:
            throw spawnExhaustiveSwitchError(option.actionType);
    }
}

const OptionsParent = styled.ul`
    padding-left: 2px;
    margin-top: 0px;
    li {
        list-style-type: none;
    }
`;

const OptionsComponentBase = styled.li`
    margin: 8px;
    padding: 8px;
    background: #eee;
    border-radius: 3px;
    border: 1px solid #ccc;
    cursor: pointer;

    &:hover {
        box-shadow: 2px 2px 10px 0px #ddd;
    }
`;

const Red = styled.div`
    font-weight: bold;
    color: maroon;
    text-align: center;
    padding: 4px;
    border: 2px solid black;
`;

type WarningProp = {warning?: boolean};

const PlayerOption = styled.li<WarningProp>`
    display: block;
    padding: 8px;
    margin-bottom: 8px;
    border-radius: 3px;
    border: ${props => (props.warning ? '2px solid maroon' : '1px solid #ccc')};
`;

export default AskUserToConfirmResourceActionDetails;
