import {
    Tag,
    CardConfig,
    RequiredGlobalParameter,
    CardAction,
    Deck,
    CardType,
    Effect,
    Condition,
    ReduxAction,
    State
} from '../constants/card-types';
import {Resource} from '../constants/resource';
import {Parameter, TilePlacement} from '../constants/board';

type PropertyCount<K extends Resource | Tag | Parameter> = {
    [k in K]?: number;
};

type ResourcePropertyCount = {
    [key in Resource]: number;
};

export class Card {
    static process<K extends Resource | Tag | Parameter>(list: K[] = []): PropertyCount<K> {
        const result: PropertyCount<K> = {};

        for (const item of list) {
            result[item] = result[item] || 0;
            result[item]!++;
        }

        return result;
    }

    // ====================================================
    // Card properties
    // ====================================================
    name: string;
    oneTimeText?: string;
    cost?: number;
    tags: Tag[];
    type: CardType;
    cardActions?: CardAction[];
    actionOrEffectText?: string;
    deck: Deck;
    victoryPoints?: number;

    // ====================================================
    // Requirements
    // ====================================================
    minTerraformRating?: number;
    requiredTags: PropertyCount<Tag>;
    /** If unset, defaults to `removeResources`. e.g. "Requires that you have 5 floaters". Basically only required for Aerosport Tournament */
    requiredResources: PropertyCount<Resource>;
    /** e.g. "Requires that you have titanium production" (Asteroid Mining Consortium, Great Escarpment Consortium */
    requiredProduction?: Resource; // e.g. Asteroid Mining Consortium
    /** e.g. "Requires 5% oxygen" */
    requiredGlobalParameter?: RequiredGlobalParameter;
    /** Restrictions about where this tile can be placed */
    tilePlacements?: TilePlacement[];
    minColonies?: number; // only for colonies expansion
    maxColonies?: number; // only for colonies expansion

    // ====================================================
    // Resource & production implications
    // ====================================================
    /** e.g. "Gain 12 heat" */
    gainResource: PropertyCount<Resource>;
    /** e.g. "Gain 5 plants, or add 4 animals to ANOTHER card" */
    gainResourceOption: Array<PropertyCount<Resource>>;
    /** e.g. "Remove 5 MC" */
    removeResources: PropertyCount<Resource>;
    /** e.g. "Remove up to 5 plants from any player" */
    removeAnyResource: PropertyCount<Resource>;
    /** e.g. "Remove up to 2 animals or 5 plants from any player" */
    removeAnyResourceOption: Array<PropertyCount<Resource>>;
    /** e.g. "Increase your MC production 2 steps" */
    increaseProduction: PropertyCount<Resource>;
    /** e.g. "Increase your plant production 1 step or your energy production 2 steps" */
    increaseProductionOption: Array<PropertyCount<Resource>>;
    /** e.g. "Decrease your MC production 2 steps" */
    decreaseProduction: PropertyCount<Resource>;
    /** e.g. "Decrease any plant production 1 step" */
    decreaseAnyProduction: PropertyCount<Resource>;
    /** e.g. "Raise oxygen 1 step" */
    increaseParameter: PropertyCount<Parameter>;
    /** e.g. "Raise your TR 1 step" */
    increaseTerraformRating?: number;

    // ====================================================
    // Card effects, actions, and held resources
    // ====================================================
    /* List of Redux actions to resolve this card being played */
    playlist?: ReduxAction[];
    /* Conditions for the event of the card being played. Triggers effects. */
    condition?(condition: Condition): boolean;
    /* Passive effects that will be in play for the remainder of the game. Triggered by condition. */
    effect?(effect: Effect): void;
    /* What type of resources can be stored on this card, if any */
    storedResourceType?: Resource;

    // ====================================================
    // state
    // ====================================================
    state?: State;
    /* Whether the card action has been used this round, if applicable */
    usedActionThisRound?: boolean;
    /* How many of the stored resource type are currently stored, if applicable */
    storedResourceAmount?: number;

    constructor(config: CardConfig) {
        // Hack to fix compile bug
        config.resources = [];

        // Card properties
        this.name = config.name;
        this.oneTimeText = config.oneTimeText;
        this.cost = config.cost;
        this.tags = config.tags;
        this.type = config.type;
        this.deck = config.deck;
        this.victoryPoints = config.victoryPoints;

        // Card requirements
        this.requiredGlobalParameter = config.requiredGlobalParameter;
        this.requiredResources = Card.process(config.requiredResources || config.removeResources);
        this.minColonies = config.minColonies;
        this.maxColonies = config.maxColonies;
        this.minTerraformRating = config.minTerraformRating;
        this.requiredProduction = config.requiredProduction;
        this.tilePlacements = config.tilePlacements;

        // Resource & production implications
        this.gainResource = Card.process(config.gainResource);
        this.gainResourceOption = (config.gainResourceOption || []).map(Card.process);
        this.removeResources = Card.process(config.removeResources);
        this.removeAnyResource = Card.process(config.removeAnyResource);
        this.removeAnyResourceOption = (config.removeAnyResourceOption || []).map(Card.process);
        this.increaseProduction = Card.process(config.increaseProduction);
        this.increaseProductionOption = (config.increaseProductionOption || []).map(Card.process);
        this.decreaseProduction = Card.process(config.decreaseProduction);
        this.decreaseAnyProduction = Card.process(config.decreaseAnyProduction);
        this.increaseParameter = Card.process(config.increaseParameter);
        this.increaseTerraformRating = config.increaseTerraformRating;
        this.requiredTags = config.requiredTags || {};

        // card effects, actions, long-term play (ACTIVE cards)
        this.cardActions = config.cardActions;
        this.playlist = config.playlist;
        this.condition = config.condition;
        this.effect = config.effect;
        this.actionOrEffectText = config.actionOrEffectText;
        this.storedResourceType = config.storedResourceType;

        // State
        this.state = config.state;
        if (config.cardActions) {
            this.usedActionThisRound = false;
        }
        if (this.storedResourceType) {
            this.storedResourceAmount = 0;
        }
    }
}
