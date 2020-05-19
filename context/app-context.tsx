import {createContext} from 'react';
import {
    applyDiscounts,
    askUserToDecreaseProduction,
    askUserToGainResource,
    askUserToLookAtCards,
    askUserToPlaceTile,
    askUserToRemoveResource,
    ASK_USER_TO_CONFIRM_RESOURCE_GAIN_TARGET,
    ASK_USER_TO_GAIN_RESOURCE,
    ASK_USER_TO_LOOK_AT_CARDS,
    ASK_USER_TO_PLACE_TILE,
    ASK_USER_TO_REMOVE_RESOURCE,
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
    revealAndDiscardTopCards,
    REVEAL_AND_DISCARD_TOP_CARDS,
    removeStorableResource,
    addParameterRequirementAdjustments,
} from '../actions';
import {Action, Amount} from '../constants/action';
import {
    Award,
    Cell,
    cellHelpers,
    CellType,
    Milestone,
    Parameter,
    TileType,
    TilePlacement,
} from '../constants/board';
import {CardType} from '../constants/card-types';
import {EffectTrigger} from '../constants/effect-trigger';
import {MinimumProductions, PARAMETER_STEPS, MAX_PARAMETERS, GameStage} from '../constants/game';
import {PropertyCounter} from '../constants/property-counter';
import {isStorableResource, Resource} from '../constants/resource';
import {StandardProjectAction, StandardProjectType} from '../constants/standard-project';
import {Tag} from '../constants/tag';
import {VariableAmount} from '../constants/variable-amount';
import {Card} from '../models/card';
import {PlayerState, RootState} from '../reducer';
import {getValidPlacementsForRequirement, findCellsWithTile} from '../selectors/board';
import {getAllowedCardsForResourceAction} from '../selectors/card';
import {VARIABLE_AMOUNT_SELECTORS} from '../selectors/variable-amount';
import {Conversion} from '../constants/conversion';

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

export function doesCardPaymentRequiresPlayerInput(card: Card) {
    return card.tags.includes(Tag.BUILDING) || card.tags.includes(Tag.SPACE);
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

function doesPlayerHaveRequiredTags(card: Card, state: RootState) {
    const player = getLoggedInPlayer(state);

    for (const tag in card.requiredTags) {
        const requiredAmount = card.requiredTags[tag];

        const playerTags = player.playedCards.flatMap(card => card.tags);

        return playerTags.filter(t => t === tag).length >= requiredAmount;
    }

    return true;
}

export function convertAmountToNumber(amount: Amount, state: RootState, card?: Card): number {
    if (typeof amount === 'number') return amount as number;

    const amountGetter = VARIABLE_AMOUNT_SELECTORS[amount];
    if (!amountGetter) return 0;
    return amountGetter(state, card) || 0;
}

function doesPlayerHaveRequiredResources(action: Action, state: RootState, parent?: Card) {
    const player = getLoggedInPlayer(state);

    for (const resource in action.removeResources) {
        const requiredAmount = convertAmountToNumber(action.removeResources[resource], state);
        if (isStorableResource(resource)) {
            const cards = getAllowedCardsForResourceAction({
                thisCard: parent!,
                resource,
                player,
                resourceLocationType: action.removeResourceSourceType!,
            });

            if (cards.every(card => (card.storedResourceAmount || 0) < requiredAmount)) {
                return false;
            }

            return true;
        }

        const playerAmount = player.resources[resource];

        return playerAmount >= requiredAmount;
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
                p.productions[production] - decreaseAnyProduction[production] <
                MinimumProductions[production]
            ) {
                return false;
            }
        }
    }

    return true;
}

function meetsTilePlacementRequirements(action: Action, state: RootState): boolean {
    if (!action.tilePlacements) return true;

    for (const {isRequired, placementRequirement} of action.tilePlacements) {
        if (!isRequired || !placementRequirement) continue;
        const possiblePlacements = getValidPlacementsForRequirement(state, placementRequirement);
        if (possiblePlacements.length === 0) return false;
    }

    return true;
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

    const {requiredProduction} = card;

    if (requiredProduction && player.productions[requiredProduction] < requiredProduction) {
        return [false, 'Required production not met.'];
    }

    return this.canPlayAction(card, state, card);
}

function canDoConversion(state: RootState, conversion?: Conversion) {
    if (!conversion) return false;
    return this.canPlayAction(conversion, state)[0];
}

function doConversion(
    state: RootState,
    playerIndex: number,
    dispatch: Function,
    conversion?: Conversion
) {
    if (!conversion) return;
    this.playAction(conversion, state);
    this.queue.push(completeAction(playerIndex));
    this.processQueue(dispatch);
}

function canPlayAction(
    action: Action,
    state: RootState,
    parent?: Card
): [boolean, string | undefined] {
    if (this.shouldDisableUI(state)) {
        return [false, ''];
    }

    if (!doesPlayerHaveRequiredResources(action, state, parent)) {
        // Also accounts for opponent resources if applicable
        return [false, 'Not enough of required resource'];
    }

    // Also accounts for opponent productions if applicable
    if (!meetsProductionRequirements(action, state)) {
        return [false, 'Does not have required production'];
    }

    if (!meetsTilePlacementRequirements(action, state)) {
        return [false, 'Cannot place tile'];
    }

    return [true, 'Good to go'];
}

function createRemoveResourceAction(
    resource: Resource,
    amount: Amount,
    playerIndex: number,
    state: RootState,
    parent?: Card
) {
    // TODO: support 4 scenarios.
    // 1. remove resource
    // 2. remove storable resource
    // 3. ask user to remove resource (e.g. trade energy for money)
    // 4. ask user to remove storable resource (e.g. spend microbes for 3x money)
    if (amount === VariableAmount.USER_CHOICE) {
        return askUserToRemoveResource(resource, amount, playerIndex);
    } else if (isStorableResource(resource)) {
        return removeStorableResource(resource, amount, parent!, playerIndex);
    } else {
        return removeResource(resource, amount, playerIndex);
    }
}

function createDecreaseProductionAction(
    resource: Resource,
    amount: Amount,
    playerIndex: number,
    state: RootState,
    parent?: Card
) {
    if (amount === VariableAmount.USER_CHOICE) {
        return askUserToDecreaseProduction(resource, amount, playerIndex);
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

function triggerEffectsFromPlayedCard(cost: number, tags: Tag[], state: RootState) {
    this.triggerEffects(
        {
            cost,
            tags,
        },
        state
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

function triggerEffects(event: Event, state: RootState) {
    const player = getLoggedInPlayer(state);
    // track the card that triggered the action so we can "add resources to this card"
    // e.g. Ecological Zone
    const actionCardPairs: ActionCardPair[] = [];
    for (const player of state.players) {
        for (const card of player.playedCards) {
            for (const effect of card.effects) {
                if (effect.trigger && effect.action) {
                    const actions = this.getActionsFromEffect(
                        event,
                        effect.trigger,
                        effect.action,
                        player,
                        player.index
                    );
                    actionCardPairs.push(...actions.map(action => [action, card]));
                }
            }
        }
    }
    for (const [action, card] of actionCardPairs) {
        this.playAction(action, state, card);
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

function playAction(action: Action, state: RootState, parent?: Card) {
    const playerIndex = getLoggedInPlayerIndex();

    for (const production in action.decreaseProduction) {
        this.queue.push(
            createDecreaseProductionAction(
                production as Resource,
                action.decreaseProduction[production],
                playerIndex,
                state,
                parent
            )
        );
    }

    for (const resource in action.removeResources) {
        this.queue.push(
            createRemoveResourceAction(
                resource as Resource,
                action.removeResources[resource],
                playerIndex,
                state,
                parent
            )
        );
    }

    if (action.revealAndDiscardTopCards) {
        this.queue.push(revealAndDiscardTopCards(action.revealAndDiscardTopCards));
    }

    if (action.lookAtCards) {
        this.queue.push(
            askUserToLookAtCards(
                playerIndex,
                action.lookAtCards.numCards,
                action.lookAtCards.numCardsToTake,
                action.lookAtCards.buyCards
            )
        );
        if (action.lookAtCards.buyCards) {
            this.queue.push(buySelectedCards(playerIndex));
        } else {
            this.queue.push(gainSelectedCards(playerIndex));
        }
    }

    for (const production in action.increaseProduction) {
        this.queue.push(
            increaseProduction(
                production as Resource,
                action.increaseProduction[production],
                playerIndex
            )
        );
    }

    for (const resource in action.gainResource) {
        if (isStorableResource(resource)) {
            this.queue.push(
                gainStorableResource(resource, action.gainResource[resource]!, parent!, playerIndex)
            );
        } else {
            this.queue.push(
                gainResource(resource as Resource, action.gainResource[resource], playerIndex)
            );
        }
    }

    if (Object.keys(action.gainResourceOption ?? {}).length > 0) {
        this.queue.push(askUserToGainResource(action, playerIndex));
    }

    for (const parameter in action.increaseParameter) {
        this.queue.push(
            increaseParameter(
                parameter as Parameter,
                action.increaseParameter[parameter],
                playerIndex
            )
        );
    }

    if (action.tilePlacements) {
        const filteredTilePlacements = filterOceanPlacementsOverMax(action.tilePlacements, state);
        for (const tilePlacement of filteredTilePlacements) {
            this.queue.push(askUserToPlaceTile(tilePlacement, playerIndex));
        }
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

    if (card.cost) {
        this.queue.push(payToPlayCard(card, playerIndex, payment));
    }

    this.queue.push(
        addParameterRequirementAdjustments(
            card.parameterRequirementAdjustments,
            card.temporaryParameterRequirementAdjustments,
            playerIndex
        )
    );

    this.queue.push(applyDiscounts(card.discounts, playerIndex));

    this.playAction(card, state, card);
    if (card.type !== CardType.CORPORATION || card.forcedAction) {
        this.queue.push(completeAction(playerIndex));
    }
}

function isActiveRound(state: RootState): boolean {
    return state.common.gameStage === GameStage.ACTIVE_ROUND;
}

function canPlayStandardProject(standardProjectAction: StandardProjectAction, state: RootState) {
    const player = getLoggedInPlayer(state);

    if (this.shouldDisableUI(state)) {
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

    return cost <= player.resources[Resource.MEGACREDIT];
}

function playStandardProject(standardProjectAction: StandardProjectAction, state: RootState) {
    const playerIndex = getLoggedInPlayerIndex();
    if (standardProjectAction.cost) {
        this.queue.push(payToPlayStandardProject(standardProjectAction, playerIndex));
    }

    this.triggerEffectsFromStandardProject(standardProjectAction.cost, state);

    this.playAction(standardProjectAction, state);
    this.queue.push(completeAction(playerIndex));
}

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
    if (player.resources[Resource.MEGACREDIT] < 8) {
        return false;
    }

    // Do they meet the requirements?
    switch (milestone) {
        case Milestone.MAYOR:
            return (
                state.common.board.flat().filter(cell => {
                    return (
                        cellHelpers.containsCity(cell) && cellHelpers.isOwnedBy(cell, player.index)
                    );
                }).length >= 3
            );
        case Milestone.GARDENER:
            return (
                state.common.board.flat().filter(cell => {
                    return (
                        cellHelpers.containsGreenery(cell) &&
                        cellHelpers.isOwnedBy(cell, player.index)
                    );
                }).length >= 3
            );
        case Milestone.BUILDER:
            return (
                state.players[player.index].playedCards.reduce((totalNumBuildingTags, card) => {
                    return totalNumBuildingTags + card.tags.filter(t => t === Tag.BUILDING).length;
                }, 0) >= 8
            );
        case Milestone.PLANNER:
            return state.players[player.index].cards.length >= 15;
        case Milestone.TERRAFORMER:
            return state.players[player.index].terraformRating >= 35;
        default:
            throw new Error('Unrecognized milestone');
    }
}

function claimMilestone(milestone: Milestone, state: RootState) {
    const playerIndex = getLoggedInPlayerIndex();
    this.queue.push(claimMilestoneAction(milestone, playerIndex));
    this.queue.push(completeAction(playerIndex));
}

function shouldDisableUI(state: RootState) {
    const player = getLoggedInPlayer(state);

    if (player.index !== state.common.currentPlayerIndex) {
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
    if (player.resources[Resource.MEGACREDIT] < cost) {
        return false;
    }

    return true;
}

function fundAward(award: Award, state: RootState) {
    const playerIndex = getLoggedInPlayerIndex();
    this.queue.push(fundAwardAction(award, playerIndex));
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
    ASK_USER_TO_REMOVE_RESOURCE,
    ASK_USER_TO_CONFIRM_RESOURCE_GAIN_TARGET,
    ASK_USER_TO_GAIN_RESOURCE,
    ASK_USER_TO_LOOK_AT_CARDS,
    REVEAL_AND_DISCARD_TOP_CARDS,
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
