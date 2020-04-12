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

export class Card {
    static process<K extends Resource | Tag | Parameter>(list: K[] = []): PropertyCount<K> {
        const result: PropertyCount<K> = {};

        for (const item of list) {
            result[item] = result[item] || 0;
            result[item]++;
        }

        return result;
    }

    requiredTags: PropertyCount<Tag>;
    requiredResources: PropertyCount<Resource>;
    removeResources: PropertyCount<Resource>;
    decreaseProduction: PropertyCount<Resource>;
    decreaseAnyProduction: PropertyCount<Resource>;
    tags: Tag[];
    increaseProduction: PropertyCount<Resource>;
    gainResource: PropertyCount<Resource>;
    removeAnyResource: PropertyCount<Resource>;
    gainResourceOption: Array<PropertyCount<Resource>>;
    removeAnyResourceOption: Array<PropertyCount<Resource>>;
    increaseProductionOption: Array<PropertyCount<Resource>>;
    increaseParameter: PropertyCount<Parameter>;

    cost?: number;
    requiredGlobalParameter?: RequiredGlobalParameter;
    minColonies?: number;
    maxColonies?: number; // only for colonies expansion
    minTerraformRating?: number;
    requiredProduction?: Resource; // e.g. Asteroid Mining Consortium
    cardActions?: CardAction[];
    usedActionThisRound?: boolean;
    actionOrEffectText?: string;
    deck: Deck;
    holdsResource?: Resource;
    name: string;
    oneTimeText?: string;
    type: CardType;
    playlist?: ReduxAction[];
    victoryPoints?: number;
    condition?(condition: Condition): boolean;
    effect?(effect: Effect): void;
    tilePlacements?: TilePlacement[];
    increaseTerraformRating?: number;
    state?: State;
    ownedByCurrentPlayer?: boolean;

    constructor(config: CardConfig) {
        config.resources = [];
        this.requiredTags = Card.process(config.requiredTags);
        this.requiredResources = Card.process(config.requiredResources || config.removeResources);
        this.removeResources = Card.process(config.removeResources);
        this.decreaseProduction = Card.process(config.decreaseProduction);
        this.decreaseAnyProduction = Card.process(config.decreaseAnyProduction);
        this.increaseProduction = Card.process(config.increaseProduction);
        this.gainResource = Card.process(config.gainResource);
        this.removeAnyResource = Card.process(config.removeAnyResource);
        this.gainResourceOption = (config.gainResourceOption || []).map(Card.process);
        this.removeAnyResourceOption = (config.removeAnyResourceOption || []).map(Card.process);
        this.increaseProductionOption = (config.increaseProductionOption || []).map(Card.process);
        this.increaseParameter = Card.process(config.increaseParameter);

        this.cost = config.cost;
        this.tags = config.tags;
        this.requiredGlobalParameter = config.requiredGlobalParameter;
        this.minColonies = config.minColonies;
        this.maxColonies = config.maxColonies;
        this.minTerraformRating = config.minTerraformRating;
        this.requiredProduction = config.requiredProduction;
        this.cardActions = config.cardActions;
        this.usedActionThisRound = config.usedActionThisRound;
        this.actionOrEffectText = config.actionOrEffectText;
        this.deck = config.deck;
        this.holdsResource = config.holdsResource;
        this.name = config.name;
        this.oneTimeText = config.oneTimeText;
        this.type = config.type;
        this.playlist = config.playlist;
        this.victoryPoints = config.victoryPoints;
        this.condition = config.condition;
        this.effect = config.effect;
        this.tilePlacements = config.tilePlacements;
        this.increaseTerraformRating = config.increaseTerraformRating;
        this.state = config.state;
        this.ownedByCurrentPlayer = config.ownedByCurrentPlayer;
    }
}
