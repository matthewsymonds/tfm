import {
    ResourceLocationType,
    ResourceAndAmount,
    getResourceName,
    isStorableResource,
} from '../constants/resource';
import {Card} from '../models/card';
import {VariableAmount} from '../constants/variable-amount';
import {useStore} from 'react-redux';
import {PlayerState} from '../reducer';
import {Tag} from '../constants/tag';
import spawnExhaustiveSwitchError from '../utils';

type Props = {
    player: PlayerState;
    resourceActionDetails: {
        actionType: 'removeResource';
        resourceAndAmounts: ResourceAndAmount[];
        card: Card;
        locationType?: ResourceLocationType;
    };
};

function getPlayersToConsider(
    player: PlayerState,
    players: PlayerState[],
    locationType?: ResourceLocationType
): PlayerState[] {
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

function getOptions(
    actionType: 'removeResource',
    resourceAndAmount: ResourceAndAmount,
    card: Card,
    player: PlayerState,
    locationType?: ResourceLocationType
) {
    if (locationType && isStorableResource(resourceAndAmount.resource)) {
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
    actionType: 'removeResource' | 'gainResource' | 'stealResource',
    resourceAndAmount: ResourceAndAmount,
    card: Card,
    player: PlayerState,
    locationType: ResourceLocationType
) {
    let {cards} = player;

    if (actionType === 'removeResource' || actionType === 'stealResource') {
        cards = cards.filter(card => (card.storedResourceAmount || 0) > 0);
    }

    cards = cards.filter(card => card.storedResourceType === resourceAndAmount.resource);

    switch (locationType) {
        case ResourceLocationType.THIS_CARD:
            cards = [card];
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
            maxAmount = resourceAndAmount.amount as number;
        } else {
            if (resourceAndAmount.amount === VariableAmount.USER_CHOICE) {
                maxAmount = card.storedResourceAmount || 0;
            } else {
                maxAmount = Math.min(
                    card.storedResourceAmount || 0,
                    resourceAndAmount.amount as number
                );
            }
        }

        let modifier = actionType === 'gainResource' ? 'to' : 'from';

        if (resourceAndAmount.amount === VariableAmount.USER_CHOICE) {
            return `Up to ${maxAmount} ${getResourceName(resourceAndAmount.resource)} ${modifier} ${
                card.name
            }`;
        }

        return `${maxAmount} ${modifier} ${getResourceName(resourceAndAmount.resource)}`;
    });
}

function getOptionsForRegularResource(
    actionType: 'removeResource' | 'gainResource' | 'stealResource',
    resourceAndAmount: ResourceAndAmount,
    player: PlayerState
) {
    let maxAmount: number;
    if (actionType === 'gainResource') {
        maxAmount = resourceAndAmount.amount as number;
    } else {
        if (resourceAndAmount.amount === VariableAmount.USER_CHOICE) {
            maxAmount = player.resources[resourceAndAmount.resource];
        } else {
            maxAmount = Math.min(
                player.resources[resourceAndAmount.resource],
                resourceAndAmount.amount as number
            );
        }
    }

    if (resourceAndAmount.amount === VariableAmount.USER_CHOICE) {
        return [`Up to ${maxAmount} ${getResourceName(resourceAndAmount.resource)}`];
    }

    return [`${maxAmount} ${getResourceName(resourceAndAmount.resource)}`];
}

function AskUserToConfirmResourceActionDetails({
    player,
    resourceActionDetails: {actionType, resourceAndAmounts, card, locationType},
}: Props) {
    const store = useStore();
    const state = store.getState();
    const players = state.players;

    const playersToConsider = getPlayersToConsider(player, players, locationType);

    const topLevelListItems = [] as Array<{
        title: string;
        items: Array<unknown>;
    }>;

    for (const playerToConsider of playersToConsider) {
        const topLevelItem = {
            title: `${playerToConsider.corporation?.name} (${playerToConsider.username})`,
            items: [] as Array<string>,
        };
        for (const resourceAndAmount of resourceAndAmounts) {
            topLevelItem.items.push(
                ...getOptions(actionType, resourceAndAmount, card, playerToConsider, locationType)
            );
        }

        if (topLevelItem.items.length > 0) {
            topLevelListItems.push(topLevelItem);
        }
    }

    return (
        <div>
            <ul>
                {topLevelListItems.map(topLevelListItem => {
                    return (
                        <li>
                            <div>{topLevelListItem.title}</div>
                            <ul>
                                {topLevelListItem.items.map(childItem => {
                                    return {childItem};
                                })}
                            </ul>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default AskUserToConfirmResourceActionDetails;
