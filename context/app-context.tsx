import {
    addForcedActionToPlayer,
    addParameterRequirementAdjustments,
    applyDiscounts,
    applyExchangeRateChanges,
    askUserToChooseResourceActionDetails,
    askUserToDiscardCards,
    askUserToLookAtCards,
    askUserToMakeActionChoice,
    askUserToPlaceTile,
    ASK_USER_TO_CHOOSE_RESOURCE_ACTION_DETAILS,
    ASK_USER_TO_DISCARD_CARDS,
    ASK_USER_TO_LOOK_AT_CARDS,
    ASK_USER_TO_MAKE_ACTION_CHOICE,
    ASK_USER_TO_PLACE_TILE,
    buySelectedCards,
    claimMilestone as claimMilestoneAction,
    completeAction,
    decreaseProduction,
    fundAward as fundAwardAction,
    gainResource,
    gainSelectedCards,
    gainStorableResource,
    increaseParameter,
    increaseProduction,
    payToPlayCard,
    payToPlayStandardProject,
    removeResource,
    removeStorableResource,
    revealAndDiscardTopCards,
    REVEAL_AND_DISCARD_TOP_CARDS,
    setPlantDiscount,
} from 'actions';
import {Action, Amount} from 'constants/action';
import {
    Award,
    Cell,
    cellHelpers,
    CellType,
    Milestone,
    Parameter,
    PlacementRequirement,
    TilePlacement,
    TileType,
} from 'constants/board';
import {CardType} from 'constants/card-types';
import {Conversion} from 'constants/conversion';
import {EffectTrigger} from 'constants/effect-trigger';
import {GameStage, MAX_PARAMETERS, MinimumProductions, PARAMETER_STEPS} from 'constants/game';
import {PropertyCounter} from 'constants/property-counter';
import {
    isStorableResource,
    PROTECTED_HABITAT_RESOURCE,
    Resource,
    ResourceAndAmount,
    ResourceLocationType,
    USER_CHOICE_LOCATION_TYPES,
} from 'constants/resource';
import {StandardProjectAction, StandardProjectType} from 'constants/standard-project';
import {Tag} from 'constants/tag';
import {VariableAmount} from 'constants/variable-amount';
import {Card} from 'models/card';
import {createContext} from 'react';
import {PlayerState, RootState} from 'reducer';
import {findCellsWithTile, getValidPlacementsForRequirement} from 'selectors/board';
import {getAllowedCardsForResourceAction} from 'selectors/card';
import {getTags, VARIABLE_AMOUNT_SELECTORS} from 'selectors/variable-amount';

function canAffordCard(card: Card, state: RootState) {
    const player = getLoggedInPlayer(state);
    let cost = getDiscountedCardCost(card, player);

    const isBuildingCard = card.tags.some(tag => tag === Tag.BUILDING);
    if (isBuildingCard) {
        cost -= player.exchangeRates[Resource.STEEL] * player.resources[Resource.STEEL];
    }

    const isSpaceCard = card.tags.some(tag => tag === Tag.SPACE);
    if (isSpaceCard) {
        cost -= player.exchangeRates[Resource.TITANIUM] * player.resources[Resource.TITANIUM];
    }

    const playerIsHelion = player.corporation.name === 'Helion';
    if (playerIsHelion) {
        cost -= player.exchangeRates[Resource.HEAT] * player.resources[Resource.HEAT];
    }

    return cost <= player.resources[Resource.MEGACREDIT];
}

export function getDiscountedCardCost(card: Card, player: PlayerState) {
    let {cost = 0} = card;
    const {discounts} = player;

    cost -= discounts.card;
    for (const tag of card.tags) {
        cost -= discounts.tags[tag] || 0;
    }
    for (const tag of [...new Set(card.tags)]) {
        cost -= discounts.cards[tag] || 0;
    }
    cost -= discounts.nextCardThisGeneration;

    return Math.max(0, cost);
}

export function doesCardPaymentRequirePlayerInput(player: PlayerState, card: Card) {
    const paymentOptions: Array<[Tag, number]> = [
        [Tag.BUILDING, player.resources[Resource.STEEL]],
        [Tag.SPACE, player.resources[Resource.TITANIUM]],
    ];

    return (
        paymentOptions.some(option => {
            const [tag, resourceAmount] = option;

            return card.tags.includes(tag) && resourceAmount > 0;
        }) ||
        (player.corporation.name === 'Helion' && player.resources[Resource.HEAT] > 0)
    );
}

function canPlayWithGlobalParameters(card: Card, state: RootState) {
    const {requiredGlobalParameter} = card;
    if (!requiredGlobalParameter) return true;
    const player = getLoggedInPlayer(state);

    const {type, min = -Infinity, max = Infinity} = requiredGlobalParameter;

    const value = state.common.parameters[type];

    // This section takes into account Inventrix/Special Design/...
    let adjustedMin = min;
    let adjustedMax = max;

    adjustedMin -= player.parameterRequirementAdjustments[type] * PARAMETER_STEPS[type];
    adjustedMin -= player.temporaryParameterRequirementAdjustments[type] * PARAMETER_STEPS[type];

    adjustedMax += player.parameterRequirementAdjustments[type] * PARAMETER_STEPS[type];
    adjustedMax += player.temporaryParameterRequirementAdjustments[type] * PARAMETER_STEPS[type];

    return value >= adjustedMin && value <= adjustedMax;
}

function canPlayWithTilePlacements(card: Card, state: RootState, player: PlayerState) {
    let tiles = state.common.board
        .flat()
        .filter(cell => cell.tile)
        .map(cell => cell.tile);

    for (const placement of card.requiredTilePlacements) {
        const match = tiles.find(tile => {
            if (placement.currentPlayer && tile.ownerPlayerIndex !== player.index) {
                return false;
            }

            return tile.type === placement.type;
        });

        if (!match) return false;

        tiles = tiles.filter(tile => tile !== match);
    }

    return true;
}

function doesPlayerHaveRequiredTags(card: Card, state: RootState) {
    const player = getLoggedInPlayer(state);

    for (const tag in card.requiredTags) {
        const requiredAmount = card.requiredTags[tag];

        const playerTags = getTags(player);

        const isEnough = playerTags.filter(t => t === tag).length >= requiredAmount;

        if (!isEnough) return false;
    }

    return true;
}

export function convertAmountToNumber(amount: Amount, state: RootState, card?: Card): number {
    if (typeof amount === 'number') return amount as number;

    const amountGetter = VARIABLE_AMOUNT_SELECTORS[amount];
    if (!amountGetter) return 0;
    return amountGetter(state, card) || 0;
}

/* Locations where we must remove the resource, or the action isn't playable */
const requiredRemoveResourceLocations = [
    ResourceLocationType.THIS_CARD,
    ResourceLocationType.ANY_CARD_OWNED_BY_YOU,
];

function canAffordActionCost(action: Action, state: RootState) {
    const player = getLoggedInPlayer(state);
    let {cost, acceptedPayment = []} = action;
    if (!cost) {
        return true;
    }

    for (const acceptedPaymentType in acceptedPayment) {
        cost -= player.exchangeRates[acceptedPaymentType] * player.resources[acceptedPaymentType];
    }

    if (player.corporation.name === 'Helion') {
        cost -= player.exchangeRates[Resource.HEAT] * player.resources[Resource.HEAT];
    }

    return cost <= player.resources[Resource.MEGACREDIT];
}

function doesPlayerHaveRequiredResourcesToRemove(action: Action, state: RootState, parent?: Card) {
    const player = getLoggedInPlayer(state);

    if (
        action.removeResourceSourceType &&
        !requiredRemoveResourceLocations.includes(action.removeResourceSourceType)
    ) {
        // If we're removing a resource and it's not required, then the action is playable
        return true;
    }

    for (const resource in action.removeResource) {
        const requiredAmount = convertAmountToNumber(action.removeResource[resource], state);
        if (isStorableResource(resource)) {
            const cards = getAllowedCardsForResourceAction({
                thisCard: parent!,
                resource,
                player,
                resourceLocationType: action.removeResourceSourceType!,
                players: state.players,
            });

            if (cards.every(card => (card.storedResourceAmount || 0) < requiredAmount)) {
                return false;
            }

            return true;
        }

        let playerAmount: number;
        if (resource === Resource.CARD) {
            playerAmount = player.cards.length;
        } else {
            playerAmount = player.resources[resource];
        }

        return playerAmount >= requiredAmount;
    }

    return true;
}

function doesAnyoneHaveResourcesToSteal(action: Action, state: RootState, card?: Card) {
    const loggedInPlayer = getLoggedInPlayer(state);
    if (action && action instanceof Card) {
        // You can play a card without completing the theft.
        return true;
    }
    // Otherwise, every other "stealResource" is a storedResource. So we only support that.
    for (const resource in action.stealResource) {
        for (const player of state.players) {
            if (player.playedCards.find(card => card.name === 'Protected Habitats')) {
                if (PROTECTED_HABITAT_RESOURCE.includes(resource as Resource)) {
                    if (player.username !== loggedInPlayer.username) {
                        continue;
                    }
                }
            }
            for (const playedCard of player.playedCards) {
                if (playedCard.name === 'Pets') {
                    continue;
                }
                if (playedCard.storedResourceType === resource && playedCard.storedResourceAmount) {
                    return true;
                }
            }
        }

        return false;
    }

    return true;
}

function meetsProductionRequirements(action: Action, state: RootState) {
    const player = getLoggedInPlayer(state);

    const {decreaseProduction, decreaseAnyProduction} = action;

    for (const production in decreaseProduction) {
        const decrease = convertAmountToNumber(decreaseProduction[production], state);
        if (player.productions[production] - decrease < MinimumProductions[production]) {
            return false;
        }
    }

    for (const production in decreaseAnyProduction) {
        for (const p of state.players) {
            if (
                p.productions[production] - decreaseAnyProduction[production] >=
                MinimumProductions[production]
            ) {
                return true;
            }
        }

        return false;
    }

    return true;
}

function meetsTilePlacementRequirements(action: Action, state: RootState): boolean {
    if (!action.tilePlacements) return true;

    for (const tilePlacement of action.tilePlacements) {
        const {isRequired, placementRequirement} = tilePlacement;
        if (!isRequired || !placementRequirement) continue;
        const possiblePlacements = getValidPlacementsForRequirement(state, tilePlacement);
        if (possiblePlacements.length === 0) return false;
    }

    return true;
}

function meetsTerraformRequirements(action, state: RootState, parent?: Card): boolean {
    if (!action.requiresTerraformRatingIncrease) return true;

    return state.players.find(player => player.corporation.name === parent?.name)!
        .terraformedThisGeneration;
}

function canPlayCard(card: Card, state: RootState): [boolean, string | undefined] {
    const player = getLoggedInPlayer(state);
    if (!canAffordCard(card, state)) {
        return [false, 'Cannot afford to play'];
    }

    if (!doesPlayerHaveRequiredTags(card, state)) {
        return [false, 'Required tags not met'];
    }

    if (!canPlayWithGlobalParameters(card, state)) {
        return [false, 'Global parameters not met'];
    }

    if (!canPlayWithTilePlacements(card, state, player)) {
        return [false, 'Tile placements not met'];
    }

    const {requiredProduction} = card;

    if (requiredProduction && player.productions[requiredProduction] < 1) {
        return [false, 'Required production not met.'];
    }

    return this.canPlayAction(card, state, card);
}

function canDoConversion(
    conversion: Conversion | undefined,
    player: PlayerState,
    resource: Resource,
    quantity: number,
    state: RootState
) {
    if (!conversion) return false;
    if (resource === Resource.PLANT) {
        // Ensure a valid placement for the greenery.
        const validGreeneryPlacements = getValidPlacementsForRequirement(state, {
            type: TileType.GREENERY,
            placementRequirement: PlacementRequirement.GREENERY,
            isRequired: true,
        });
        if (validGreeneryPlacements.length === 0) return false;
    }
    return player.resources[resource] >= quantity;
}

function doConversion(
    state: RootState,
    playerIndex: number,
    dispatch: Function,
    conversion?: Conversion
) {
    if (!conversion) return;
    const conversionAction = {
        ...conversion,
        removeResource: {
            ...(conversion.removeResource || {}),
        },
    };
    const plantDiscount = state.players[playerIndex].plantDiscount || 0;
    const removeResource = conversionAction.removeResource;
    removeResource[Resource.PLANT] =
        ((removeResource[Resource.PLANT] as number) || 0) - plantDiscount;

    this.playAction({action: conversionAction, state});
    this.queue.push(completeAction(playerIndex));
    this.processQueue(dispatch);
}

function canPlayCardAction(
    action: Action,
    state: RootState,
    parent?: Card
): [boolean, string | undefined] {
    if (!canAffordActionCost(action, state)) {
        return [false, 'Cannot afford action cost'];
    }

    return this.canPlayAction(action, state, parent);
}

function canPlayAction(
    action: Action,
    state: RootState,
    parent?: Card
): [boolean, string | undefined] {
    if (this.shouldDisableUI(state)) {
        return [false, ''];
    }

    return this.canPlayActionInSpiteOfUI(action, state, parent);
}

function canPlayActionInSpiteOfUI(action: Action, state: RootState, parent?: Card) {
    if (!doesPlayerHaveRequiredResourcesToRemove(action, state, parent)) {
        return [false, 'Not enough of required resource'];
    }

    if (!doesAnyoneHaveResourcesToSteal(action, state, parent)) {
        return [false, `There's no source to steal from`];
    }

    // Also accounts for opponent productions if applicable
    if (!meetsProductionRequirements(action, state)) {
        return [false, 'Does not have required production'];
    }

    if (!meetsTilePlacementRequirements(action, state)) {
        return [false, 'Cannot place tile'];
    }

    if (!meetsTerraformRequirements(action, state, parent)) {
        return [false, 'You have not yet terraformed this generation'];
    }

    return [true, 'Good to go'];
}

function createInitialRemoveResourceAction(
    resource: Resource,
    amount: Amount,
    playerIndex: number,
    parent?: Card,
    playedCard?: Card,
    locationType?: ResourceLocationType
) {
    const requiresLocationChoice =
        locationType && USER_CHOICE_LOCATION_TYPES.includes(locationType);
    const requiresAmountChoice = amount === VariableAmount.USER_CHOICE;

    const requiresDiscard = resource === Resource.CARD;

    if (requiresDiscard) {
        return askUserToDiscardCards(playerIndex, amount, parent);
    }

    if (requiresAmountChoice || requiresLocationChoice) {
        return askUserToChooseResourceActionDetails({
            actionType: 'removeResource',
            resourceAndAmounts: [{resource, amount}],
            card: parent!,
            playedCard,
            locationType,
            playerIndex,
        });
    }

    if (isStorableResource(resource)) {
        // Assumes you're removing from "This card" (parent)
        return removeStorableResource(resource, amount as number, playerIndex, parent!);
    } else {
        // Assumes you're removing from your own resources
        return removeResource(resource, amount as number, playerIndex, playerIndex);
    }
}

function createRemoveResourceOptionAction(
    options: PropertyCounter<Resource>,
    playerIndex: number,
    parent?: Card,
    locationType?: ResourceLocationType
) {
    // HACK: all instances of `removeResourceOption` use a number amount, so we don't account for variable amounts here
    const resourceAndAmounts = Object.keys(options).map((resource: Resource) => ({
        resource,
        amount: options[resource] as number,
    }));
    return askUserToChooseResourceActionDetails({
        actionType: 'removeResource',
        resourceAndAmounts,
        card: parent!,
        locationType,
        playerIndex,
    });
}

function createInitialGainResourceAction(
    resource: Resource,
    amount: Amount,
    playerIndex: number,
    parent?: Card,
    playedCard?: Card,
    locationType?: ResourceLocationType
) {
    const requiresLocationChoice =
        locationType &&
        USER_CHOICE_LOCATION_TYPES.includes(locationType) &&
        resource !== Resource.CARD;
    if (requiresLocationChoice) {
        return askUserToChooseResourceActionDetails({
            actionType: 'gainResource',
            resourceAndAmounts: [{resource, amount}],
            card: parent!,
            playedCard,
            locationType,
            playerIndex,
        });
    }

    if (isStorableResource(resource)) {
        return gainStorableResource(resource, amount, parent!, playerIndex);
    } else {
        return gainResource(resource, amount, playerIndex);
    }
}

function createGainResourceOptionAction(
    options: PropertyCounter<Resource>,
    playerIndex: number,
    parent?: Card,
    playedCard?: Card,
    locationType?: ResourceLocationType
) {
    // HACK: all instances of `gainResourceOption` use a number amount, so we don't account for variable amounts here
    const resourceAndAmounts = Object.keys(options).map((resource: Resource) => ({
        resource,
        amount: options[resource] as number,
    }));
    return askUserToChooseResourceActionDetails({
        actionType: 'gainResource',
        resourceAndAmounts,
        card: parent!,
        playedCard,
        locationType,
        playerIndex,
    });
}

function createDecreaseProductionAction(
    resource: Resource,
    amount: Amount,
    playerIndex: number,
    state: RootState,
    parent?: Card
) {
    if (amount === VariableAmount.USER_CHOICE_MIN_ZERO) {
        return askUserToChooseResourceActionDetails({
            actionType: 'decreaseProduction',
            resourceAndAmounts: [{resource, amount}],
            card: parent!,
            playerIndex,
        });
    } else {
        return decreaseProduction(resource, amount, playerIndex);
    }
}

function triggerEffectsFromTilePlacement(placedTile: TileType, cell: Cell, state: RootState) {
    this.triggerEffects(
        {
            placedTile,
            cell,
        },
        state
    );
}

function triggerEffectsFromStandardProject(cost: number, state: RootState) {
    if (!cost) return;

    this.triggerEffects(
        {
            standardProject: true,
            cost,
        },
        state
    );
}

function triggerEffectsFromPlayedCard(card: Card, state: RootState) {
    const {cost, tags} = card;
    this.triggerEffects(
        {
            cost: cost || 0,
            tags,
        },
        state,
        card
    );
}

interface Event {
    standardProject?: StandardProjectType;
    cost?: number;
    placedTile?: TileType;
    cell?: Cell;
    tags?: Tag[];
}

type ActionCardPair = [Action, Card];

function triggerEffects(event: Event, state: RootState, playedCard?: Card) {
    const player = getLoggedInPlayer(state);
    // track the card that triggered the action so we can "add resources to this card"
    // e.g. Ecological Zone
    for (const thisPlayer of state.players) {
        const actionCardPairs: ActionCardPair[] = [];

        for (const card of thisPlayer.playedCards) {
            for (const effect of card.effects) {
                if (effect.trigger && effect.action) {
                    const actions = this.getActionsFromEffect(
                        event,
                        effect.trigger,
                        effect.action,
                        thisPlayer,
                        player.index
                    );
                    actionCardPairs.push(...actions.map(action => [action, card]));
                }
            }
        }
        for (const [action, card] of actionCardPairs) {
            this.playAction({
                action,
                state,
                parent: card,
                playedCard,
                thisPlayerIndex: thisPlayer.index,
            });
        }
    }
}

function getActionsFromEffect(
    event: Event,
    trigger: EffectTrigger,
    effectAction: Action,
    player: PlayerState,
    currentPlayerIndex: number
): Action[] {
    if (!trigger.anyPlayer && player.index !== currentPlayerIndex) return [];

    if (trigger.placedTile) {
        if (event.placedTile !== trigger.placedTile) return [];
        if (trigger.onMars && event.cell?.type === CellType.OFF_MARS) return [];

        return [effectAction];
    }

    if (trigger.steelOrTitaniumPlacementBonus) {
        const bonus = event.cell?.bonus || [];
        if (!bonus.includes(Resource.STEEL) && !bonus.includes(Resource.TITANIUM)) return [];
        return [effectAction];
    }

    if (trigger.standardProject) {
        if (!event.standardProject) return [];

        return [effectAction];
    }

    if (trigger.cost) {
        if ((event.cost || 0) < trigger.cost) return [];
        return [effectAction];
    }

    const eventTags = event.tags || [];

    if (trigger.cardTags) {
        for (const tag of trigger.cardTags || []) {
            if (!eventTags.includes(tag)) return [];
        }
        return [effectAction];
    }

    const triggerTags = trigger.tags || [];
    const numTagsTriggered = eventTags.filter(tag => triggerTags.includes(tag)).length;
    return Array(numTagsTriggered).fill(effectAction);
}

function playAction({
    action,
    state,
    parent,
    playedCard,
    thisPlayerIndex,
    payment,
    withPriority,
}: {
    action: Action;
    state: RootState;
    parent?: Card; // origin of action
    playedCard?: Card; // card that triggered action
    thisPlayerIndex?: number;
    payment?: PropertyCounter<Resource>;
    withPriority?: boolean;
}) {
    const playerIndex = thisPlayerIndex ?? getLoggedInPlayerIndex();
    const items: Array<{type: string}> = [];

    // Only accept payment for actions with a parent (ie, card actions).
    // Other actions should already be accounting for payment in their internals.
    // TODO: Consolidate payment logic into here
    if (payment && action.cost && parent) {
        for (const resource in payment) {
            items.push(
                removeResource(resource as Resource, payment[resource], playerIndex, playerIndex)
            );
        }
    }

    for (const production in action.decreaseProduction) {
        items.push(
            createDecreaseProductionAction(
                production as Resource,
                action.decreaseProduction[production],
                playerIndex,
                state,
                parent
            )
        );
    }

    for (const production in action.decreaseAnyProduction) {
        items.push(
            askUserToChooseResourceActionDetails({
                actionType: 'decreaseProduction',
                card: parent!,
                playerIndex,
                locationType: ResourceLocationType.ANY_PLAYER,
                resourceAndAmounts: [
                    {
                        resource: production as Resource,
                        amount: action.decreaseAnyProduction[production],
                    },
                ],
            })
        );
    }

    if (action.choice) {
        items.push(askUserToMakeActionChoice(action.choice, parent!, playedCard!, playerIndex));
    }

    if (action.tilePlacements) {
        const filteredTilePlacements = filterOceanPlacementsOverMax(action.tilePlacements, state);
        for (const tilePlacement of filteredTilePlacements) {
            items.push(askUserToPlaceTile(tilePlacement, playerIndex));
        }
    }

    for (const resource in action.removeResource) {
        items.push(
            createInitialRemoveResourceAction(
                resource as Resource,
                action.removeResource[resource],
                playerIndex,
                parent,
                playedCard,
                action.removeResourceSourceType
            )
        );
    }

    if (Object.keys(action.removeResourceOption ?? {}).length > 0) {
        items.push(
            createRemoveResourceOptionAction(
                action.removeResourceOption!,
                playerIndex,
                parent,
                action.removeResourceSourceType
            )
        );
    }

    for (const resource in action.stealResource) {
        const resourceAndAmounts: Array<ResourceAndAmount> = [
            {
                resource: resource as Resource,
                amount: action.stealResource[resource] as number,
            },
        ];
        items.push(
            askUserToChooseResourceActionDetails({
                actionType: 'stealResource',
                resourceAndAmounts,
                card: parent!,
                playerIndex,
            })
        );
    }

    if (action.revealAndDiscardTopCards) {
        items.push(revealAndDiscardTopCards(action.revealAndDiscardTopCards));
    }

    if (action.lookAtCards) {
        items.push(
            askUserToLookAtCards(
                playerIndex,
                action.lookAtCards.numCards,
                action.lookAtCards.numCardsToTake,
                action.lookAtCards.buyCards
            )
        );
        if (action.lookAtCards.buyCards) {
            items.push(buySelectedCards(playerIndex));
        } else {
            items.push(gainSelectedCards(playerIndex));
        }
    }

    for (const production in action.increaseProduction) {
        items.push(
            increaseProduction(
                production as Resource,
                action.increaseProduction[production],
                playerIndex
            )
        );
    }

    for (const resource in action.gainResource) {
        items.push(
            createInitialGainResourceAction(
                resource as Resource,
                action.gainResource[resource],
                playerIndex,
                parent,
                playedCard,
                action.gainResourceTargetType
            )
        );
    }

    if (Object.keys(action.gainResourceOption ?? {}).length > 0) {
        items.push(
            createGainResourceOptionAction(
                action.gainResourceOption!,
                playerIndex,
                parent,
                playedCard,
                action.gainResourceTargetType
            )
        );
    }

    for (const parameter in action.increaseParameter) {
        items.push(
            increaseParameter(
                parameter as Parameter,
                action.increaseParameter[parameter],
                playerIndex
            )
        );
    }

    // TODO: Move this to `applyDiscounts`, change `plantDiscount` to a new discount type
    if (action.plantDiscount) {
        items.push(setPlantDiscount(action.plantDiscount, playerIndex));
    }
    if (withPriority) {
        this.queue.unshift(...items);
    } else {
        this.queue.push(...items);
    }
}

function filterOceanPlacementsOverMax(
    tilePlacements: TilePlacement[],
    state: RootState
): TilePlacement[] {
    const numOceans = findCellsWithTile(state, TileType.OCEAN).length;

    let filteredPlacements: TilePlacement[] = [];
    let numOceanTilePlacements = 0;

    for (const placement of tilePlacements) {
        if (placement.type !== TileType.OCEAN) {
            filteredPlacements.push(placement);
            continue;
        }

        if (numOceanTilePlacements + numOceans < MAX_PARAMETERS[Parameter.OCEAN]) {
            filteredPlacements.push(placement);
            numOceanTilePlacements++;
        }
    }

    return filteredPlacements;
}

function playCard(card: Card, state: RootState, payment?: PropertyCounter<Resource>) {
    const playerIndex = getLoggedInPlayerIndex();

    // 1. Pay for the card.
    //    - This should account for discounts
    //    - This should account for non-MC payment, which is prompted by the UI
    //      and included in `payment`
    if (card.cost) {
        this.queue.push(payToPlayCard(card, playerIndex, payment));
    }

    // 2. Apply effects that will affect future turns:
    //     - parameter requirement adjustments (next turn or permanent)
    //     - discounts (card discounts, standard project discounts, etc)
    //     - exchange rates (e.g. advanced alloys)
    this.queue.push(
        addParameterRequirementAdjustments(
            card.parameterRequirementAdjustments,
            card.temporaryParameterRequirementAdjustments,
            playerIndex
        )
    );
    this.queue.push(applyDiscounts(card.discounts, playerIndex));
    this.queue.push(applyExchangeRateChanges(card.exchangeRates, playerIndex));

    // 3. Play the action
    //     - action choices (done with priority)
    //     - gaining/losing/stealing resources & production
    //     - tile pacements
    //     - discarding/drawing cards
    this.playAction({action: card, state, parent: card});
    const increaseProductionOptions = Object.keys(card.increaseProductionOption ?? {});

    // 4. Perform increase production choice
    //     - (this currently only affects Artificial Photosynthesis)
    //     - TODO: move this to `playAction` to colocate with other production deltas
    if (increaseProductionOptions.length > 0) {
        const resourceAndAmounts = increaseProductionOptions.map(key => {
            return {
                resource: key as Resource,
                amount: card.increaseProductionOption![key],
            };
        });
        this.queue.push(
            askUserToChooseResourceActionDetails({
                actionType: 'increaseProduction',
                resourceAndAmounts,
                card,
                playerIndex,
            })
        );
    }

    if (card.forcedAction) {
        this.queue.push(addForcedActionToPlayer(playerIndex, card.forcedAction));
    }

    // Don't call `completeAction` for corporations, because we use `player.action` as a proxy
    // for players being ready to start round 1, and don't want to increment it.
    if (card.type !== CardType.CORPORATION) {
        this.queue.push(completeAction(playerIndex));
    }
}

function isActiveRound(state: RootState): boolean {
    return state.common.gameStage === GameStage.ACTIVE_ROUND;
}

function canPlayStandardProject(standardProjectAction: StandardProjectAction, state: RootState) {
    const player = getLoggedInPlayer(state);

    const [canPlay] = this.canPlayAction(standardProjectAction, state);
    if (!canPlay) {
        return false;
    }

    if (!isActiveRound(state)) {
        return false;
    }

    // Selling patents is the only standard project whose cost is cards, not megacredits
    if (standardProjectAction.type === StandardProjectType.SELL_PATENTS) {
        return player.cards.length > 0;
    }

    let cost = standardProjectAction.cost!;
    const {discounts} = player;

    cost -= discounts.standardProjects;
    if (standardProjectAction.type === StandardProjectType.POWER_PLANT) {
        cost -= discounts.standardProjectPowerPlant;
    }

    const megacredits = player.resources[Resource.MEGACREDIT];
    if (player.corporation.name === 'Helion') {
        const heat = player.resources[Resource.HEAT];
        return cost <= megacredits + heat;
    } else {
        return cost <= megacredits;
    }
}

function playStandardProject(
    standardProjectAction: StandardProjectAction,
    payment: PropertyCounter<Resource> | undefined,
    state: RootState
) {
    const playerIndex = getLoggedInPlayerIndex();
    if (standardProjectAction.cost) {
        this.queue.push(payToPlayStandardProject(standardProjectAction, payment!, playerIndex));
    }

    this.triggerEffectsFromStandardProject(standardProjectAction.cost, state);

    this.playAction({action: standardProjectAction, state});
    this.queue.push(completeAction(playerIndex));
}

function getPlayerCities(player: PlayerState, state: RootState) {
    return state.common.board.flat().filter(cell => {
        return cellHelpers.containsCity(cell) && cellHelpers.isOwnedBy(cell, player.index);
    }).length;
}

function getPlayerGreeneries(player: PlayerState, state: RootState) {
    return state.common.board.flat().filter(cell => {
        return cellHelpers.containsGreenery(cell) && cellHelpers.isOwnedBy(cell, player.index);
    }).length;
}

function getPlayerBuildingTags(player: PlayerState) {
    return getTags(player).filter(tag => tag === Tag.BUILDING).length;
}

function getPlayerCards(player: PlayerState) {
    return player.cards.length;
}

function getPlayerTerraformRating(player: PlayerState) {
    return player.terraformRating;
}

export const milestoneQuantitySelectors = {
    [Milestone.MAYOR]: getPlayerCities,
    [Milestone.GARDENER]: getPlayerGreeneries,
    [Milestone.BUILDER]: getPlayerBuildingTags,
    [Milestone.PLANNER]: getPlayerCards,
    [Milestone.TERRAFORMER]: getPlayerTerraformRating,
};

export const minMilestoneQuantity = {
    [Milestone.MAYOR]: 3,
    [Milestone.GARDENER]: 3,
    [Milestone.BUILDER]: 8,
    [Milestone.PLANNER]: 16,
    [Milestone.TERRAFORMER]: 35,
};

function canClaimMilestone(milestone: Milestone, state: RootState) {
    const player = getLoggedInPlayer(state);

    if (!isActiveRound(state)) {
        return false;
    }

    // Is it availiable?
    if (state.common.claimedMilestones.length === 3) {
        return false;
    }

    if (state.common.claimedMilestones.find(claim => claim.milestone === milestone)) {
        return false;
    }

    // Can they afford it?
    let availableMoney = player.resources[Resource.MEGACREDIT];
    if (player.corporation.name === 'Helion') {
        availableMoney += player.resources[Resource.HEAT];
    }

    if (availableMoney < 8) {
        return false;
    }

    return milestoneQuantitySelectors[milestone](player, state) >= minMilestoneQuantity[milestone];
}

function claimMilestone(
    milestone: Milestone,
    payment: PropertyCounter<Resource>,
    state: RootState
) {
    const playerIndex = getLoggedInPlayerIndex();
    this.queue.push(claimMilestoneAction(milestone, payment, playerIndex));
    this.queue.push(completeAction(playerIndex));
}

function shouldDisableUI(state: RootState) {
    const player = getLoggedInPlayer(state);

    if (player.index !== state.common.currentPlayerIndex) {
        return true;
    }
    if (state.common.gameStage !== GameStage.ACTIVE_ROUND) {
        return true;
    }
    if (this.queue.length > 0) {
        return true;
    }

    return false;
}

function canFundAward(award: Award, state: RootState) {
    const player = getLoggedInPlayer(state);

    if (this.shouldDisableUI(state)) return false;

    if (!isActiveRound(state)) {
        return false;
    }

    // Is it available?
    if (state.common.fundedAwards.length === 3) {
        return false;
    }
    if (state.common.fundedAwards.find(claim => claim.award === award)) {
        return false;
    }

    // Can they afford it?
    const cost = [8, 14, 20][state.common.fundedAwards.length];

    let availableMoney = player.resources[Resource.MEGACREDIT];
    if (player.corporation.name === 'Helion') {
        availableMoney += player.resources[Resource.HEAT];
    }

    if (availableMoney < cost) {
        return false;
    }

    return true;
}

function fundAward(award: Award, payment: PropertyCounter<Resource>, state: RootState) {
    const playerIndex = getLoggedInPlayerIndex();
    this.queue.push(fundAwardAction(award, payment, playerIndex));
    this.queue.push(completeAction(playerIndex));
}

function processQueue(dispatch: Function) {
    while (this.queue.length > 0) {
        const item = this.queue.shift();
        dispatch(item);
        if (shouldPause(item)) {
            break;
        }
    }
}

const PAUSE_ACTIONS = [
    ASK_USER_TO_PLACE_TILE,
    ASK_USER_TO_CHOOSE_RESOURCE_ACTION_DETAILS,
    ASK_USER_TO_LOOK_AT_CARDS,
    REVEAL_AND_DISCARD_TOP_CARDS,
    ASK_USER_TO_DISCARD_CARDS,
    ASK_USER_TO_MAKE_ACTION_CHOICE,
];

function shouldPause(action: {type: string}): boolean {
    return PAUSE_ACTIONS.includes(action.type);
}

let loggedInPlayerIndex = -1;

export function getLoggedInPlayerIndex() {
    return loggedInPlayerIndex;
}

export function getLoggedInPlayer(state) {
    return state.players[loggedInPlayerIndex];
}

function setLoggedInPlayerIndex(index: number) {
    loggedInPlayerIndex = index;
}

export const appContext = {
    queue: [] as Array<Object>,
    canPlayCard,
    playCard,
    canPlayAction,
    canPlayActionInSpiteOfUI,
    canPlayCardAction,
    canDoConversion,
    doConversion,
    playAction,
    canPlayStandardProject,
    playStandardProject,
    canClaimMilestone,
    claimMilestone,
    canFundAward,
    shouldDisableUI,
    fundAward,
    processQueue,
    triggerEffects,
    triggerEffectsFromTilePlacement,
    triggerEffectsFromStandardProject,
    triggerEffectsFromPlayedCard,
    getActionsFromEffect,
    setLoggedInPlayerIndex,
    getLoggedInPlayer,
};

export const AppContext = createContext(appContext);
