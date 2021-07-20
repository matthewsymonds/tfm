import {BuildColony} from 'actions';
import {Action, ActionType, Amount, LookAtCardsConfig, PlayCardParams} from 'constants/action';
import {Parameter, TilePlacement} from 'constants/board';
import {CardSelectionCriteria} from 'constants/card-selection-criteria';
import {
    CardConfig,
    CardType,
    ConditionalPayment,
    Deck,
    ExchangeRates,
    RequiredGlobalParameter,
    RequiredTilePlacement,
} from 'constants/card-types';
import {cardConfigs} from 'constants/cards';
import {Discounts} from 'constants/discounts';
import {Effect} from 'constants/effect';
import {NumericPropertyCounter, PropertyCounter} from 'constants/property-counter';
import {Resource, ResourceLocationType} from 'constants/resource';
import {Tag} from 'constants/tag';

export class Card {
    isCard = true;
    // ====================================================
    // Card properties
    // ====================================================
    name: string;
    text: string;
    cost?: number;
    tags: Tag[];
    type: CardType;
    deck: Deck;
    victoryPoints?: Amount;
    actionType: ActionType;
    action?: Action;
    effects: Effect[] = [];
    requiredTilePlacements: RequiredTilePlacement[] = [];
    steps: Action[] = [];

    // ====================================================
    // Requirements
    // ====================================================
    /** e.g. "Requires 25 TF Rating" */
    minTerraformRating?: number;
    requiredTags: PropertyCounter<Tag>;
    /** If unset, defaults to `removeResource`. e.g. "Requires that you have 5 floaters". Basically only required for Aerosport Tournament */
    requiredResources: PropertyCounter<Resource>;
    /** e.g. "Requires that you have titanium production" (Asteroid Mining Consortium, Great Escarpment Consortium */
    requiredProduction?: Resource; // e.g. Asteroid Mining Consortium
    /** e.g. "Requires 5% oxygen" */
    requiredGlobalParameter?: RequiredGlobalParameter;
    /** Restrictions about where this tile can be placed */
    tilePlacements: TilePlacement[];
    minColonies?: number; // only for colonies expansion
    maxColonies?: number; // only for colonies expansion

    // ====================================================
    // Resource & production implications
    // ====================================================
    /** e.g. "Gain 12 heat" */
    gainResource: PropertyCounter<Resource>;
    /** e.g. Sponsored Academies */
    opponentsGainResource: PropertyCounter<Resource>;
    /** e.g. "Gain 5 plants, or add 4 animals to ANOTHER card" */
    gainResourceOption: PropertyCounter<Resource>;
    /** e.g. Manutech */
    gainResourceWhenIncreaseProduction?: number;
    /** e.g. "Remove 5 MC" */
    /** e.g. "Remove up to 5 plants from any player" */
    removeResource: PropertyCounter<Resource>;
    /** e.g. "Remove up to 2 animals or 5 plants from any player" */
    removeResourceOption: PropertyCounter<Resource>;
    /** e.g. "Remove up to 4 MC FROM A PLAYER WITH A JOVIAN TAG" */
    removeResourceSourceType?: ResourceLocationType;
    /** e.g. "Increase your MC production 2 steps" */
    increaseProduction: PropertyCounter<Resource>;
    /** e.g. "Increase your plant production 1 step or your energy production 2 steps" */
    increaseProductionOption: PropertyCounter<Resource>;
    /** Records Mining Rights and Mining Area's production increase. */
    increaseProductionResult?: Resource;
    /** e.g. Duplicate only the production box of one of your building cards  */
    duplicateProduction?: Tag;
    /** e.g. "Decrease your MC production 2 steps" */
    decreaseProduction: PropertyCounter<Resource>;
    /** e.g. "Decrease any plant production 1 step" */
    decreaseAnyProduction: PropertyCounter<Resource>;
    /** e.g. "Raise oxygen 1 step" */
    increaseParameter: NumericPropertyCounter<Parameter>;
    /** e.g. "Raise your TR 1 step" */
    increaseTerraformRating?: Amount;
    /** e.g. "Add 1 animal to THIS CARD" */
    gainResourceTargetType?: ResourceLocationType;
    stealResource: PropertyCounter<Resource>;
    /** e.g. "Look at the top 3 cards. Take one into hand and discard the other two" */
    lookAtCards?: LookAtCardsConfig;

    /** e.g. Prelude Acquired Space Agency */
    revealTakeAndDiscard?: PropertyCounter<CardSelectionCriteria>;

    // ====================================================
    // Card effects, actions, and held resources
    // ====================================================
    /* What type of resources can be stored on this card, if any */
    storedResourceType?: Resource;
    /* Whether the card action has been used this round, if applicable */
    lastRoundUsedAction?: number;
    /* How many of the stored resource type are currently stored, if applicable */
    storedResourceAmount?: number;

    // Action that will be deferred until the first round (corporations are played
    // before round 1 has begun).
    forcedAction?: Action;

    // Describes the discounts the card gives.
    discounts: Discounts;

    plantDiscount?: number;
    // Describes the exchange rates changes that this card results in.
    // Currently only relevant for: Phobolog, Advanced Alloys
    exchangeRates: ExchangeRates;

    conditionalPayment?: ConditionalPayment;

    parameterRequirementAdjustments: PropertyCounter<Parameter>;
    temporaryParameterRequirementAdjustments: PropertyCounter<Parameter>;
    choice: Action[];
    playCard?: PlayCardParams;
    buildColony?: BuildColony;

    // Polyphemos
    cardCost?: number;

    constructor(config: CardConfig) {
        // Hack to fix compile bug
        config.resources = {};

        // Card properties
        this.name = config.name;
        this.text = config.text || '';
        this.cost = config.cost;
        this.forcedAction = config.forcedAction;
        this.tags = config.tags;
        this.type = config.type;
        this.deck = config.deck;
        this.victoryPoints = config.victoryPoints;
        this.actionType = ActionType.CARD;

        // Card requirements
        this.requiredGlobalParameter = config.requiredGlobalParameter;
        this.requiredResources = config.requiredResources || {};
        this.minColonies = config.minColonies;
        this.maxColonies = config.maxColonies;
        this.minTerraformRating = config.minTerraformRating;
        this.requiredProduction = config.requiredProduction;
        this.tilePlacements = config.tilePlacements || [];

        // Resource & production implications
        this.gainResource = config.gainResource || {};
        this.opponentsGainResource = config.opponentsGainResource || {};
        this.gainResourceOption = config.gainResourceOption || {};
        this.gainResourceTargetType = config.gainResourceTargetType;
        this.lookAtCards = config.lookAtCards;
        this.removeResource = config.removeResource || {};
        this.removeResourceOption = config.removeResourceOption || {};
        this.removeResourceSourceType = config.removeResourceSourceType;
        this.stealResource = config.stealResource || {};
        this.increaseProduction = config.increaseProduction || {};
        this.increaseProductionOption = config.increaseProductionOption || {};
        this.duplicateProduction = config.duplicateProduction;
        this.decreaseProduction = config.decreaseProduction || {};
        this.decreaseAnyProduction = config.decreaseAnyProduction || {};
        this.increaseParameter = config.increaseParameter || {};
        this.increaseTerraformRating = config.increaseTerraformRating || 0;
        this.requiredTags = config.requiredTags || {};
        const {tags = {}, cards = {}, ...rest} = config.discounts || {};
        this.discounts = {
            card: 0,
            tags,
            cards,
            standardProjects: 0,
            standardProjectPowerPlant: 0,
            nextCardThisGeneration: 0,
            trade: 0,
            ...rest,
        };
        this.plantDiscount = config.plantDiscount || 0;
        const {exchangeRates = {}} = config;
        this.exchangeRates = {
            ...exchangeRates,
        };

        this.parameterRequirementAdjustments = config.parameterRequirementAdjustments || {};
        this.temporaryParameterRequirementAdjustments =
            config.temporaryParameterRequirementAdjustments || {};

        // card effects, actions, long-term play (ACTIVE cards)
        this.effects = [];
        if (config.effect) {
            this.effects.push(config.effect);
        }
        if (config.effects) {
            this.effects.push(...config.effects);
        }

        if (config.steps) {
            this.steps.push(...config.steps);
        }

        if (config.requiredTilePlacements) {
            this.requiredTilePlacements.push(...config.requiredTilePlacements);
        }
        if (config.cardCost) {
            this.cardCost = config.cardCost;
        }

        this.action = config.action;
        this.storedResourceType = config.storedResourceType;
        if (config.action) {
            this.lastRoundUsedAction = 0;
        }
        if (this.storedResourceType) {
            this.storedResourceAmount = 0;
        }
        if (config.conditionalPayment) {
            this.conditionalPayment = config.conditionalPayment;
        }
        if (config.revealTakeAndDiscard) {
            this.revealTakeAndDiscard = config.revealTakeAndDiscard;
        }
        if (config.buildColony) {
            this.buildColony = config.buildColony;
        }
        this.gainResourceWhenIncreaseProduction = config.gainResourceWhenIncreaseProduction;
        this.choice = config.choice || [];

        this.playCard = config.playCard;
    }
}

export const doesCardHaveDiscounts = (card: Card) => {
    for (const value of Object.values(card.discounts)) {
        if (typeof value === 'number') {
            if (value > 0) {
                return true;
            }
        } else {
            for (const subValue of Object.values(value)) {
                if (typeof subValue === 'number' && subValue > 0) {
                    return true;
                }
            }
        }
    }
    if (card.plantDiscount) {
        return true;
    }
    return false;
};

export const cards = cardConfigs.map(config => new Card(config));

export const cardMap: {[name: string]: Card} = {};

for (const card of cards) {
    cardMap[card.name] = card;
}

// Used as a filler in censored state.
export const dummyCard = new Card({
    deck: Deck.BASIC,
    tags: [Tag.EVENT],
    name: '',
    type: CardType.EVENT,
});
