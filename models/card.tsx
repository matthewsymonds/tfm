import {
    CardConfig,
    RequiredGlobalParameter,
    Deck,
    CardType,
    ReduxAction
} from '../constants/card-types';
import {Tag} from '../constants/tag';
import {Effect} from '../constants/effect';
import {Action} from '../constants/action';
import {Resource} from '../constants/resource';
import {Parameter, TilePlacement} from '../constants/board';
import {PropertyCounter} from '../constants/property-counter';

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
    victoryPoints?: number;
    action?: Action;
    effect?: Effect;

    // ====================================================
    // Requirements
    // ====================================================
    minTerraformRating?: number;
    requiredTags: PropertyCounter<Tag>;
    /** If unset, defaults to `removeResources`. e.g. "Requires that you have 5 floaters". Basically only required for Aerosport Tournament */
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
    removeResources: PropertyCounter<Resource>;
    /** e.g. "Remove up to 5 plants from any player" */
    removeAnyResource: PropertyCounter<Resource>;
    /** e.g. "Remove up to 2 animals or 5 plants from any player" */
    removeAnyResourceOption: PropertyCounter<Resource>;
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

    // ====================================================
    // Card effects, actions, and held resources
    // ====================================================
    /* What type of resources can be stored on this card, if any */
    storedResourceType?: Resource;
    /* Whether the card action has been used this round, if applicable */
    usedActionThisRound?: boolean;
    /* How many of the stored resource type are currently stored, if applicable */
    storedResourceAmount?: number;

    constructor(config: CardConfig) {
        // Hack to fix compile bug
        config.resources = {};

        // Card properties
        this.name = config.name;
        this.text = config.text || '';
        this.cost = config.cost;
        this.tags = config.tags;
        this.type = config.type;
        this.deck = config.deck;
        this.victoryPoints = config.victoryPoints;

        // Card requirements
        this.requiredGlobalParameter = config.requiredGlobalParameter;
        this.requiredResources = config.requiredResources || config.removeResources || {};
        this.minColonies = config.minColonies;
        this.maxColonies = config.maxColonies;
        this.minTerraformRating = config.minTerraformRating;
        this.requiredProduction = config.requiredProduction;
        this.tilePlacements = config.tilePlacements || [];

        // Resource & production implications
        this.gainResource = config.gainResource || {};
        this.gainResourceOption = config.gainResourceOption || {};
        this.removeResources = config.removeResources || {};
        this.removeAnyResource = config.removeAnyResource || {};
        this.removeAnyResourceOption = config.removeAnyResourceOption || {};
        this.increaseProduction = config.increaseProduction || {};
        this.increaseProductionOption = config.increaseProductionOption || {};
        this.decreaseProduction = config.decreaseProduction || {};
        this.decreaseAnyProduction = config.decreaseAnyProduction || {};
        this.increaseParameter = config.increaseParameter || {};
        this.increaseTerraformRating = config.increaseTerraformRating || 0;
        this.requiredTags = config.requiredTags || {};

        // card effects, actions, long-term play (ACTIVE cards)
        this.effect = config.effect;
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
