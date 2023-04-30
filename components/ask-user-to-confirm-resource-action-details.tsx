import {
    decreaseProduction,
    decreaseProductionIfPossible,
    gainResource,
    gainStorableResource,
    increaseProduction,
    removeResource,
    removeStorableResource,
    stealResource,
    stealStorableResource,
} from 'actions';
import {ApiClient} from 'api-client';
import {Box, Flex} from 'components/box';
import {ChangeResourceIconography} from 'components/card/CardIconography';
import {ProductionIcon} from 'components/icons/production';
import {ResourceIcon} from 'components/icons/resource';
import {Amount} from 'constants/action';
import {TileType} from 'constants/board';
import {CardType} from 'constants/card-types';
import {MinimumProductions} from 'constants/game';
import {
    getResourceName,
    isStorableResource,
    PROTECTED_HABITAT_RESOURCE,
    ResourceAndAmount,
    ResourceLocationType,
    STANDARD_RESOURCES,
} from 'constants/resource';
import {Resource} from 'constants/resource-enum';
import {Tag} from 'constants/tag';
import {VariableAmount} from 'constants/variable-amount';
import {useApiClient} from 'hooks/use-api-client';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import {Card} from 'models/card';
import React, {useState} from 'react';
import {GameState, PlayerState, useTypedSelector} from 'reducer';
import {getAdjacentCellsForCell} from 'selectors/board';
import {convertAmountToNumber} from 'selectors/convert-amount-to-number';
import {getCard} from 'selectors/get-card';
import {getPlayedCards} from 'selectors/get-played-cards';
import {deserializeCard, SerializedCard} from 'state-serialization';
import styled from 'styled-components';
import spawnExhaustiveSwitchError from 'utils';
import {AskUserToMakeChoice} from './ask-user-to-make-choice';
import {PlayerCorpAndIcon} from './icons/player';
import {colors} from './ui';

export type ResourceActionType =
    | 'removeResource'
    | 'gainResource'
    | 'stealResource'
    | 'increaseProduction'
    | 'decreaseProduction'
    | 'decreaseProductionIfPossible';

export type ResourceActionOption = {
    location: PlayerState | Card;
    quantity: number;
    resource: Resource;
    isVariable: boolean;
    actionType: ResourceActionType;
    card?: Card;
    text: React.ReactNode;
};

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
        card: SerializedCard;
        playedCard?: SerializedCard;
        locationType?: ResourceLocationType;
    };
};

function targetsMultiplePlayers(
    locationType: ResourceLocationType | undefined
): boolean {
    switch (locationType) {
        case undefined:
            return false;
        // Not sure why this is needed.
        case null:
            return false;
        case ResourceLocationType.THIS_CARD:
        case ResourceLocationType.ANY_CARD_OWNED_BY_YOU:
        case ResourceLocationType.LAST_PLAYED_CARD:
        case ResourceLocationType.OWN_CORPORATION:
            return false;
        case ResourceLocationType.ANY_CARD_WITH_NONZERO_STORABLE_RESOURCE:
        case ResourceLocationType.VENUS_CARD:
        case ResourceLocationType.JOVIAN_CARD:
            // These really only refer to your own cards.
            return false;
        case ResourceLocationType.ANY_CARD:
        case ResourceLocationType.ANY_PLAYER:
            return true;
        case ResourceLocationType.ANY_PLAYER_WITH_TILE_ADJACENT_TO_MOST_RECENTLY_PLACED_TILE:
            return true;
        case ResourceLocationType.ANY_PLAYER_WITH_VENUS_TAG:
            return true;
        default:
            throw spawnExhaustiveSwitchError(locationType);
    }
}

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
    if (!targetsMultiplePlayers(locationType)) {
        return [player];
    }

    switch (locationType) {
        // Do some additional filtering
        case ResourceLocationType.ANY_PLAYER_WITH_TILE_ADJACENT_TO_MOST_RECENTLY_PLACED_TILE:
            const neighbors = getAdjacentCellsForCell(
                state,
                state.common.mostRecentTilePlacementCell
            );
            const playerIndices = neighbors
                .filter(cell => cell?.tile?.type !== TileType.LAND_CLAIM)
                .map(cell => cell?.tile?.ownerPlayerIndex);
            return players.filter(player =>
                playerIndices.includes(player.index)
            );
        case ResourceLocationType.ANY_PLAYER_WITH_VENUS_TAG:
            return players.filter(player =>
                getPlayedCards(player)
                    .flatMap(card => card.tags)
                    .some(tag => tag === Tag.VENUS)
            );
        default:
            return players;
    }
}

export type SerializedResourceActionOption = Omit<
    ResourceActionOption,
    'location' | 'text' | 'card'
> & {
    location: {type: 'Player' | 'Card'; name: string};
    card?: SerializedCard;
};

export function serializeResourceActionOption(
    option: ResourceActionOption
): SerializedResourceActionOption {
    return {
        quantity: option.quantity,
        resource: option.resource,
        isVariable: option.isVariable,
        actionType: option.actionType,
        card: option.card ? {name: option.card.name} : undefined,
        location: {
            type: option.location instanceof Card ? 'Card' : 'Player',
            name:
                option.location instanceof Card
                    ? option.location.name
                    : option.location.username,
        },
    };
}

export function deserializeResourceOptionAction(
    option: SerializedResourceActionOption,
    state: GameState
): ResourceActionOption {
    const location = (
        option.location.type === 'Player'
            ? state.players.find(
                  player => player.username === option.location.name
              )
            : state.players
                  .flatMap(player => getPlayedCards(player))
                  .find(card => card.name === option.location.name)
    )!;

    return {
        ...option,
        location,
        card: option.card ? deserializeCard(option.card) : undefined,
        text: '',
    };
}

export function getPlayerOptionWrappers(
    state: GameState,
    player: PlayerState,
    resourceActionDetails: {
        actionType: ResourceActionType;
        resourceAndAmounts: {resource: Resource; amount: Amount}[];
        card: SerializedCard;
        locationType?: ResourceLocationType;
    } = player.pendingResourceActionDetails!
): PlayerOptionWrapper[] {
    const players = state.players;
    const {actionType, resourceAndAmounts, locationType} =
        resourceActionDetails;
    const card = getCard(resourceActionDetails.card);
    let playersToConsider = getPlayersToConsider(
        player,
        players,
        locationType,
        actionType,
        state
    );
    const playerOptionWrappers: PlayerOptionWrapper[] = [];

    playersToConsider = [...playersToConsider].sort((alpha, beta) => {
        if (actionType !== 'gainResource') {
            if (alpha.username === player.username) {
                return 1;
            }

            if (beta.username === player.username) {
                return -1;
            }
        }

        return alpha.username.toLowerCase() < beta.username.toLowerCase()
            ? -1
            : 1;
    });

    for (const playerToConsider of playersToConsider) {
        const playerOptionWrapper: PlayerOptionWrapper = {
            title: `${playerToConsider.corporation.name} (${
                playerToConsider.username === player.username
                    ? 'YOU'
                    : playerToConsider.username
            })`,
            options: [],
            player: playerToConsider,
        };
        for (const resourceAndAmount of resourceAndAmounts) {
            if (
                actionType === 'removeResource' ||
                actionType === 'stealResource'
            ) {
                if (
                    playerToConsider.playedCards.find(
                        card => card.name === 'Protected Habitats'
                    )
                ) {
                    if (
                        PROTECTED_HABITAT_RESOURCE.includes(
                            resourceAndAmount.resource
                        )
                    ) {
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
                locationType,
                state
            );

            if (actionType !== 'gainResource') {
                // pets can't be removed
                options = options.filter(option => {
                    if (!(option.location instanceof Card)) {
                        return true;
                    }

                    return option.location.name !== 'Pets';
                });
            }

            if (actionType !== 'decreaseProductionIfPossible') {
                options = options.filter(option => option.quantity !== 0);
            }
            playerOptionWrapper.options.push(...options);
        }

        const zeroChangeAllowed =
            (actionType === 'removeResource' &&
                locationType &&
                locationType !== ResourceLocationType.ANY_CARD_OWNED_BY_YOU) ||
            actionType === 'decreaseProductionIfPossible';

        playerOptionWrapper.options = playerOptionWrapper.options.filter(
            option => option.quantity > 0 || zeroChangeAllowed
        );

        if (playerOptionWrapper.options.length > 0) {
            playerOptionWrappers.push(playerOptionWrapper);
        }
    }

    return playerOptionWrappers;
}

function getOptions(
    actionType: ResourceActionType,
    resourceAndAmount: ResourceAndAmount,
    card: Card,
    player: PlayerState,
    locationType: ResourceLocationType | undefined,
    state: GameState
): ResourceActionOption[] {
    if (
        actionType === 'decreaseProduction' ||
        actionType === 'decreaseProductionIfPossible'
    ) {
        return getOptionsForDecreaseProduction(resourceAndAmount, player);
    } else if (actionType === 'increaseProduction') {
        return getOptionsForIncreaseProduction(resourceAndAmount, player);
    } else if (isStorableResource(resourceAndAmount.resource)) {
        return getOptionsForStorableResource(
            actionType,
            resourceAndAmount,
            card,
            player,
            locationType,
            state
        );
    } else {
        return getOptionsForRegularResource(
            actionType,
            resourceAndAmount,
            player
        );
    }
}

function getOptionsForIncreaseProduction(
    productionAndAmount: ResourceAndAmount,
    player: PlayerState
): ResourceActionOption[] {
    const {amount, resource} = productionAndAmount;
    const quantity = amount as number;
    const text = formatText({
        quantity,
        resource,
        actionType: 'increaseProduction',
    });

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
    let resources =
        resource === Resource.ANY_STANDARD_RESOURCE
            ? STANDARD_RESOURCES
            : [resource];

    let maxAmount: number;

    const isVariable = amount === VariableAmount.USER_CHOICE_MIN_ZERO;

    if (amount === VariableAmount.USER_CHOICE_MIN_ZERO) {
        // insulation-specific
        maxAmount = player.productions[resource];
    } else {
        maxAmount = amount as number;
    }

    return resources.flatMap(resource => {
        if (
            player.productions[resource] - MinimumProductions[resource] <
            (amount as number)
        ) {
            // Not enough production
            return [];
        }

        const text = formatText({
            quantity: maxAmount,
            resource,
            actionType: 'decreaseProduction',
        });

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
    });
}

function getOptionsForStorableResource(
    actionType: ResourceActionType,
    resourceAndAmount: ResourceAndAmount,
    originalCard: Card,
    player: PlayerState,
    locationType: ResourceLocationType | undefined,
    state: GameState
): ResourceActionOption[] {
    let cards = getPlayedCards(player);
    const {resource, amount} = resourceAndAmount;
    const isVariable = amount === VariableAmount.USER_CHOICE;

    if (actionType === 'removeResource' || actionType === 'stealResource') {
        cards = cards.filter(card => (card.storedResourceAmount || 0) > 0);
    }
    if (resourceAndAmount.resource !== Resource.ANY_STORABLE_RESOURCE) {
        cards = cards.filter(
            card => card.storedResourceType === resourceAndAmount.resource
        );
    }

    switch (locationType) {
        case ResourceLocationType.THIS_CARD:
            cards = [originalCard];
            break;
        case ResourceLocationType.OWN_CORPORATION: {
            const playedCards = getPlayedCards(player);
            cards = playedCards.filter(
                card => card.type === CardType.CORPORATION
            );
            break;
        }
        case ResourceLocationType.LAST_PLAYED_CARD: {
            const playedCards = getPlayedCards(player);
            // don't use the filtered list, because it's explicitly the last card played
            const lastPlayedCard = playedCards[playedCards.length - 1];
            cards = [];
            if (
                lastPlayedCard.storedResourceType === resourceAndAmount.resource
            ) {
                cards = [lastPlayedCard];
            }
            break;
        }
        case ResourceLocationType.VENUS_CARD:
            cards = cards.filter(
                card =>
                    card.tags.includes(Tag.VENUS) && !!card.storedResourceType
            );
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
                card =>
                    card.storedResourceType &&
                    card.storedResourceType === resource
            );
            break;
        default:
            break;
    }

    return cards.map(serializedCard => {
        const card = getCard(serializedCard);
        let maxAmount: number;
        if (actionType === 'gainResource') {
            maxAmount = convertAmountToNumber(amount, state, player, card);
        } else {
            if (isVariable) {
                maxAmount = card.storedResourceAmount || 0;
            } else {
                maxAmount = Math.min(
                    card.storedResourceAmount || 0,
                    amount as number
                );
            }
        }

        const text = formatText({
            quantity: maxAmount,
            // For CEO's favorite project, the resource icon should be determin
            resource: card.storedResourceType ?? resource,
            actionType,
            locationName: card.name,
        });

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

function getVerb(
    actionType: ResourceActionType,
    locationName?: string
): string {
    if (locationName && actionType === 'gainResource') {
        return 'Add';
    }

    return {
        gainResource: 'Gain',
        removeResource: 'Remove',
        stealResource: 'Steal',
        increaseProduction: 'Increase',
        decreaseProduction: 'Decrease',
    }[actionType];
}

function formatText({
    quantity,
    resource,
    actionType,
    locationName,
}: {
    quantity: number;
    resource: Resource;
    actionType: ResourceActionType;
    locationName?: string;
}) {
    const modifier = actionType === 'gainResource' ? 'to' : 'from';

    const locationAppendix = locationName ? `${modifier} ${locationName}` : '';

    const verb = getVerb(actionType, locationName);

    return (
        <Flex
            alignItems="center"
            key={`${quantity}-${resource}-${actionType}-${locationName}`}
        >
            <span>{verb}</span>
            <Flex margin="0 4px">
                <ChangeResourceIconography
                    changeResource={{[resource]: quantity}}
                    opts={{
                        isInline: true,
                        isProduction: [
                            'increaseProduction',
                            'decreaseProduction',
                        ].includes(actionType),
                        isNegative: [
                            'decreaseProduction',
                            'removeResource',
                        ].includes(actionType),
                        useRedBorder: [
                            'decreaseProduction',
                            'stealResource',
                            'removeResorce',
                        ].includes(actionType),
                    }}
                />
            </Flex>
            <span>{locationAppendix}</span>
        </Flex>
    );
}

function getOptionsForRegularResource(
    actionType: ResourceActionType,
    resourceAndAmount: ResourceAndAmount,
    player: PlayerState
): ResourceActionOption[] {
    let {amount, resource} = resourceAndAmount;
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

    const text = formatText({quantity: maxAmount, resource, actionType});

    if (
        resource === Resource.BASED_ON_PRODUCTION_DECREASE &&
        player.mostRecentProductionDecrease
    ) {
        resource = player.mostRecentProductionDecrease;
    }

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

export function quantityAndResource(quantity: number, resource: Resource) {
    const isPluralizable =
        resource !== Resource.HEAT &&
        resource !== Resource.ENERGY &&
        resource !== Resource.STEEL &&
        resource !== Resource.TITANIUM;
    return `${quantity} ${getResourceName(resource)}${
        isPluralizable && quantity !== 1 ? 's' : ''
    }`;
}

export function canSkipResourceActionDetails(
    actionType: ResourceActionType,
    locationType?: ResourceLocationType | undefined
) {
    // Players should be required to do *most* resource actions.
    // - gaining resources is required.
    // - stealing resources (predators) *cannot* be skipped to gain a tempo.
    // - decrease production, required
    // - increase production, required
    // - The ONLY time that a resource effect is optional is if it's
    //   removing resources and it may target opponents.
    //
    // Another notable exception to this is in TURMOIL, where certain
    // events (e.g. Corporate Alliance) can decrease production *if possible*.
    // To avoid confusion with the otherwise ALWAYS required `decreaseProduction`,
    // we've implemented this under a separate property `decreaseProductionIfPossible`.
    return (
        actionType == 'removeResource' && targetsMultiplePlayers(locationType)
    );
}

function AskUserToConfirmResourceActionDetails({
    player,
    resourceActionDetails: {actionType, resourceAndAmounts, card, playedCard},
}: Props) {
    const playerOptionWrappers: PlayerOptionWrapper[] = useTypedSelector(
        state => getPlayerOptionWrappers(state, player)
    );

    const apiClient = useApiClient();

    const handleSkip = () => {
        apiClient.skipChooseResourceActionDetailsAsync();
    };

    let shouldShowSkip = canSkipResourceActionDetails(
        actionType,
        player.pendingResourceActionDetails?.locationType
    );

    const isNegativeAction = [
        'removeResource',
        'decreaseProduction',
        'stealResource',
    ].includes(actionType);

    const fullCard = getCard(card);

    return (
        <>
            <AskUserToMakeChoice
                card={card}
                playedCard={playedCard}
                orientation="vertical"
            >
                {playerOptionWrappers.map(playerOptionWrapper => {
                    const shouldShowWarningMessage =
                        !playerOptionWrapper.options.some(
                            option => option.isVariable
                        ) &&
                        playerOptionWrapper.player === player &&
                        isNegativeAction &&
                        (playerOptionWrappers.length > 1 ||
                            (playerOptionWrappers.length === 1 &&
                                actionType === 'removeResource' &&
                                fullCard.removeResourceSourceType &&
                                fullCard.removeResourceSourceType !==
                                    ResourceLocationType.THIS_CARD &&
                                fullCard.removeResourceSourceType !==
                                    ResourceLocationType.ANY_CARD_OWNED_BY_YOU));
                    return (
                        <PlayerOption
                            showWarning={shouldShowWarningMessage}
                            key={playerOptionWrapper.player.username}
                        >
                            <Flex
                                marginBottom="4px"
                                style={{
                                    fontWeight: 700,
                                    fontSize: '1.1em',
                                }}
                            >
                                <PlayerCorpAndIcon
                                    player={playerOptionWrapper.player}
                                    includeUsername={true}
                                    color={colors.TEXT_LIGHT_1}
                                />
                            </Flex>
                            {shouldShowWarningMessage && (
                                <span
                                    style={{
                                        fontStyle: 'italic',
                                        fontSize: '0.85em',
                                        marginBottom: 4,
                                    }}
                                >
                                    Warning: This is you!
                                </span>
                            )}
                            <Flex flexWrap="wrap">
                                {playerOptionWrapper.options.map(
                                    (option, index) => {
                                        return (
                                            <Box
                                                key={index}
                                                marginLeft={
                                                    index > 0 ? '4px' : '0'
                                                }
                                                marginBottom="8px"
                                            >
                                                <OptionComponent
                                                    apiClient={apiClient}
                                                    option={option}
                                                />
                                            </Box>
                                        );
                                    }
                                )}
                            </Flex>
                        </PlayerOption>
                    );
                })}
            </AskUserToMakeChoice>
            {shouldShowSkip && <button onClick={handleSkip}>Skip</button>}
        </>
    );
}

function OptionComponent({
    option,
    apiClient,
}: {
    option: ResourceActionOption;
    apiClient: ApiClient;
}) {
    const player = useLoggedInPlayer();

    function handleClick() {
        apiClient.completeChooseResourceActionDetailsAsync({
            option,
            variableAmount,
        });
    }

    let max = player.resources[option.resource];
    if (option.actionType === 'decreaseProduction') {
        max =
            player.productions[option.resource] -
            MinimumProductions[option.resource];
    }

    if (option.card && isStorableResource(option.resource)) {
        max = option.quantity;
    }

    const [variableAmount, setVariableAmount] = useState(Math.min(1, max));

    if (option.isVariable && option.actionType === 'decreaseProduction') {
        // Currently this is just insulation
        return (
            <Flex flexDirection="column">
                <Flex alignItems="center">
                    <span>Decrease</span>
                    <Box margin="0 4px">
                        <ProductionIcon name={option.resource} size={20} />
                    </Box>
                    <span>by</span>
                    <input
                        type="number"
                        min={0}
                        style={{margin: '0 4px'}}
                        value={variableAmount}
                        max={max}
                        onChange={e =>
                            setVariableAmount(
                                Math.max(
                                    0,
                                    Math.min(max, Number(e.target.value))
                                )
                            )
                        }
                    />
                    <span>{variableAmount === 1 ? ' step' : ' steps'},</span>
                </Flex>
                <Flex alignItems="center" marginTop="2px">
                    <span>increase</span>
                    <Box margin="0 4px">
                        <ProductionIcon name={Resource.MEGACREDIT} size={20} />
                    </Box>
                    <span>by</span>
                    <input
                        type="number"
                        min={0}
                        style={{margin: '0 4px'}}
                        value={variableAmount}
                        max={max}
                        onChange={e =>
                            setVariableAmount(
                                Math.max(
                                    0,
                                    Math.min(max, Number(e.target.value))
                                )
                            )
                        }
                    />
                    <span>{variableAmount === 1 ? ' step' : ' steps'}</span>
                </Flex>
                <Box marginTop="8px">
                    <button onClick={handleClick}>Confirm</button>
                </Box>
            </Flex>
        );
    } else if (option.isVariable) {
        return (
            <React.Fragment>
                <span>Remove</span>
                <input
                    type="number"
                    min={1}
                    style={{margin: '0 4px'}}
                    value={variableAmount}
                    max={max}
                    onChange={e =>
                        setVariableAmount(
                            Math.max(0, Math.min(max, Number(e.target.value)))
                        )
                    }
                />
                <Box margin="0 4px">
                    <ResourceIcon name={option.resource} size={20} />
                </Box>
                <button
                    onClick={handleClick}
                    style={{display: 'inline-flex', marginLeft: 8}}
                >
                    Confirm
                </button>
            </React.Fragment>
        );
    } else {
        return (
            <button onClick={handleClick} style={{padding: 4}}>
                {option.text}
            </button>
        );
    }
}

export function getAction(
    option: ResourceActionOption,
    player: PlayerState,
    variableAmount: number
) {
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
        case 'decreaseProductionIfPossible':
            return decreaseProductionIfPossible(
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

type WarningProp = {showWarning?: boolean};

const PlayerOption = styled.div<WarningProp>`
    display: flex;
    flex-direction: column;
    margin-bottom: 24px;
`;

export default AskUserToConfirmResourceActionDetails;
