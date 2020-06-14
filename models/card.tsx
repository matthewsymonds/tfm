import {Action, ActionType, Amount, LookAtCardsConfig} from 'constants/action';
import {Parameter, TilePlacement} from 'constants/board';
import {
    CardConfig,
    CardType,
    Deck,
    RequiredGlobalParameter,
    ExchangeRates,
    RequiredTilePlacement,
} from 'constants/card-types';
import {cardConfigs} from 'constants/cards';
import {Discounts} from 'constants/discounts';
import {Effect} from 'constants/effect';
import {PropertyCounter} from 'constants/property-counter';
import {Resource, ResourceLocationType} from 'constants/resource';
import {Tag} from 'constants/tag';

export class Card {
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

    // ====================================================
    // Requirements
    // ====================================================
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
    /** e.g. "Gain 5 plants, or add 4 animals to ANOTHER card" */
    gainResourceOption: PropertyCounter<Resource>;
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
    /** e.g. "Decrease your MC production 2 steps" */
    decreaseProduction: PropertyCounter<Resource>;
    /** e.g. "Decrease any plant production 1 step" */
    decreaseAnyProduction: PropertyCounter<Resource>;
    /** e.g. "Raise oxygen 1 step" */
    increaseParameter: PropertyCounter<Parameter>;
    /** e.g. "Raise your TR 1 step" */
    increaseTerraformRating?: number;
    /** e.g. "Add 1 animal to THIS CARD" */
    gainResourceTargetType?: ResourceLocationType;
    stealResource: PropertyCounter<Resource>;
    stealResourceOption: PropertyCounter<Resource>;
    /** e.g. "Look at the otp c" */
    lookAtCards?: LookAtCardsConfig;

    // ====================================================
    // Card effects, actions, and held resources
    // ====================================================
    /* What type of resources can be stored on this card, if any */
    storedResourceType?: Resource;
    /* Whether the card action has been used this round, if applicable */
    usedActionThisRound?: boolean;
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

    parameterRequirementAdjustments: PropertyCounter<Parameter>;
    temporaryParameterRequirementAdjustments: PropertyCounter<Parameter>;

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
        this.requiredResources = config.requiredResources || config.removeResource || {};
        this.minColonies = config.minColonies;
        this.maxColonies = config.maxColonies;
        this.minTerraformRating = config.minTerraformRating;
        this.requiredProduction = config.requiredProduction;
        this.tilePlacements = config.tilePlacements || [];

        // Resource & production implications
        this.gainResource = config.gainResource || {};
        this.gainResourceOption = config.gainResourceOption || {};
        this.gainResourceTargetType = config.gainResourceTargetType;
        this.lookAtCards = config.lookAtCards;
        this.removeResource = config.removeResource || {};
        this.removeResourceOption = config.removeResourceOption || {};
        this.removeResourceSourceType = config.removeResourceSourceType;
        this.stealResource = config.stealResource || {};
        this.stealResourceOption = config.stealResourceOption || {};
        this.increaseProduction = config.increaseProduction || {};
        this.increaseProductionOption = config.increaseProductionOption || {};
        this.decreaseProduction = config.decreaseProduction || {};
        this.decreaseAnyProduction = config.decreaseAnyProduction || {};
        this.increaseParameter = config.increaseParameter || {};
        this.increaseTerraformRating = config.increaseTerraformRating || 0;
        this.requiredTags = config.requiredTags || {};
        const {tags = {}, cards = {}, ...rest} = config.discounts || {};
        this.discounts = {
            card: 0,
            tags: {
                [Tag.SPACE]: 0,
                [Tag.VENUS]: 0,
                [Tag.BUILDING]: 0,
                [Tag.SCIENCE]: 0,
                [Tag.EARTH]: 0,
                [Tag.POWER]: 0,
                ...tags,
            },
            cards: {
                [Tag.SPACE]: 0,
                [Tag.EARTH]: 0,
                ...cards,
            },
            standardProjects: 0,
            standardProjectPowerPlant: 0,
            nextCardThisGeneration: 0,
            trade: 0,
            ...rest,
        };
        this.plantDiscount = config.plantDiscount || 0;
        const {exchangeRates = {}} = config;
        this.exchangeRates = {
            [Resource.TITANIUM]: 0,
            [Resource.STEEL]: 0,
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

        if (config.requiredTilePlacements) {
            this.requiredTilePlacements.push(...config.requiredTilePlacements);
        }

        this.action = config.action;
        this.storedResourceType = config.storedResourceType;
        if (config.action) {
            this.usedActionThisRound = false;
        }
        if (this.storedResourceType) {
            this.storedResourceAmount = 0;
        }
    }
}

export const cards = cardConfigs.map(config => new Card(config));
