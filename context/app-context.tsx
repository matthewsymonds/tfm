import {createContext} from 'react';
import {
    applyDiscounts,
    askUserToDecreaseProduction,
    askUserToGainResource,
    askUserToPlaceTile,
    askUserToRemoveResource,
    ASK_USER_TO_CONFIRM_RESOURCE_GAIN_TARGET,
    ASK_USER_TO_GAIN_RESOURCE,
    ASK_USER_TO_PLACE_TILE,
    ASK_USER_TO_REMOVE_RESOURCE,
    claimMilestone as claimMilestoneAction,
    completeAction,
    decreaseProduction,
    fundAward as fundAwardAction,
    gainResource,
    gainStorableResource,
    increaseParameter,
    increaseProduction,
    payToPlayCard,
    payToPlayStandardProject,
    removeResource,
    REVEAL_AND_DISCARD_TOP_CARD,
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
} from '../constants/board';
import {CardType} from '../constants/card-types';
import {EffectTrigger} from '../constants/effect-trigger';
import {MinimumProductions} from '../constants/game';
import {PropertyCounter} from '../constants/property-counter';
import {isStorableResource, Resource} from '../constants/resource';
import {StandardProjectAction, StandardProjectType} from '../constants/standard-project';
import {Tag} from '../constants/tag';
import {VariableAmount} from '../constants/variable-amount';
import {Card} from '../models/card';
import {PlayerState, RootState} from '../reducer';
import {getValidPlacementsForRequirement} from '../selectors/board';
import {getLoggedInPlayer} from '../selectors/players';
import {VARIABLE_AMOUNT_SELECTORS} from '../selectors/variable-amount';

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

    const {type, min = -Infinity, max = Infinity} = requiredGlobalParameter;

    const value = state.common.parameters[type];

    return value >= min && value <= max;
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

function doesPlayerHaveRequiredResources(action: Action, state: RootState) {
    const player = getLoggedInPlayer(state);

    for (const resource in action.removeResources) {
        const requiredAmount = convertAmountToNumber(action.removeResources[resource], state);

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

    if (
        requiredProduction &&
        state.players[state.loggedInPlayerIndex].productions[requiredProduction] <
            requiredProduction
    ) {
        return [false, 'Required production not met.'];
    }

    return canPlayAction(card, state);
}

function canPlayAction(action: Action, state: RootState): [boolean, string | undefined] {
    // Also accounts for opponent resources if applicable
    if (!doesPlayerHaveRequiredResources(action, state)) {
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
    if (amount === VariableAmount.USER_CHOICE) {
        return askUserToRemoveResource(resource, amount, playerIndex);
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

function triggerEffects(event: Event, state: RootState) {
    const actions: Action[] = [];
    for (const player of state.players) {
        for (const card of player.playedCards) {
            for (const effect of card.effects) {
                if (effect.trigger && effect.action) {
                    actions.push(
                        ...this.getActionsFromEffect(
                            event,
                            effect.trigger,
                            effect.action,
                            player,
                            state.loggedInPlayerIndex
                        )
                    );
                }
            }
        }
    }
    for (const action of actions) {
        this.playAction(action, state);
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
    const playerIndex = state.loggedInPlayerIndex;

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
        for (const tilePlacement of action.tilePlacements) {
            this.queue.push(askUserToPlaceTile(tilePlacement, playerIndex));
        }
    }
}

function playCard(card: Card, state: RootState, payment?: PropertyCounter<Resource>) {
    const playerIndex = state.loggedInPlayerIndex;

    if (card.cost) {
        this.queue.push(payToPlayCard(card, playerIndex, payment));
    }

    this.queue.push(applyDiscounts(card.discounts, playerIndex));

    this.playAction(card, state, card);
    if (card.type !== CardType.CORPORATION || card.forcedAction) {
        this.queue.push(completeAction(playerIndex));
    }
}

function canPlayStandardProject(standardProjectAction: StandardProjectAction, state: RootState) {
    const player = getLoggedInPlayer(state);

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
    const playerIndex = state.loggedInPlayerIndex;
    if (standardProjectAction.cost) {
        this.queue.push(payToPlayStandardProject(standardProjectAction, playerIndex));
    }

    this.triggerEffectsFromStandardProject(standardProjectAction.cost, state);

    this.playAction(standardProjectAction, state);
    this.queue.push(completeAction(playerIndex));
}

function canClaimMilestone(milestone: Milestone, state: RootState) {
    const player = getLoggedInPlayer(state);

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
    const playerIndex = state.loggedInPlayerIndex;
    this.queue.push(claimMilestoneAction(milestone, playerIndex));
    this.queue.push(completeAction(playerIndex));
}

function canFundAward(award: Award, state: RootState) {
    const player = getLoggedInPlayer(state);

    // Is it availiable?
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
    const playerIndex = state.loggedInPlayerIndex;
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
    REVEAL_AND_DISCARD_TOP_CARD,
];

function shouldPause(action: {type: string}): boolean {
    return PAUSE_ACTIONS.includes(action.type);
}

export const appContext = {
    queue: [] as Array<Object>,
    canPlayCard,
    playCard,
    canPlayAction,
    playAction,
    canPlayStandardProject,
    playStandardProject,
    canClaimMilestone,
    claimMilestone,
    canFundAward,
    fundAward,
    processQueue,
    triggerEffects,
    triggerEffectsFromTilePlacement,
    triggerEffectsFromStandardProject,
    triggerEffectsFromPlayedCard,
    getActionsFromEffect,
};

export const AppContext = createContext(appContext);
