import {Resource} from './resource';
import {Tile, TileType, TilePlacement, Parameter} from './board';
import {ActionType, StandardProjectType} from './action';
import {GameState} from '../reducer';

interface CardRequirement {
    cost?: number;
    minOcean?: number;
    maxOcean?: number;
    minOxygen?: number;
    maxOxygen?: number;
    minTemperature?: number;
    maxTemperature?: number;
    minVenus?: number;
    maxVenus?: number;
    minColonies?: number;
    maxColonies?: number; // only for colonies expansion
    minTerraformRating?: number;
    requiredProduction?: Resource; // e.g. Asteroid Mining Consortium
    requiredTags?: Tag[];
    requiredResource?: Resource[];

    removeResource?: Resource[];
    decreaseProduction?: Resource[];
    decreaseAnyProduction?: Resource[];
}

type CardActionRequirement = {
    canPayWith: Resource[];
    canPayFromOtherCards?: boolean; // e.g. predators, ants
};

type CardAction = {
    playlist: ReduxAction[];
    requirement?: CardActionRequirement;
};

type ReduxAction = {
    type: string;
    payload: any;
};

export interface Card extends CardRequirement {
    cardActions?: CardAction[];
    usedActionThisRound?: boolean;
    actionOrEffectText?: string;
    deck: Deck;
    holdsResource?: Resource;
    name: string;
    oneTimeText?: string;
    tags: Tag[];
    type: CardType;
    storedResources?: Resource[];
    playlist?: ReduxAction[];
    terraformRatingIncrease?: number;
    victoryPoints?: number;
    condition?(condition: Condition): boolean;
    effect?(effect: Effect): void;
    increaseProduction?: Resource[];
    gainResource?: Resource[];
    removeAnyResource?: Resource[];
    gainResourceOption?: Resource[][];
    removeAnyResourceOption?: Resource[][];
    increaseProductionOption?: Resource[][];
    tilePlacements?: TilePlacement[];
    increaseParameter?: Parameter[];

    // ????
    state?: State;
    ownedByCurrentPlayer?: boolean;
}

interface State {
    tags: Tag[];
    cards: Card[];
}

export type Condition = {
    actionType?: ActionType;
    card?: Card;
    cost?: number;
    newTag?: boolean;
    onMars?: boolean;
    samePlayer?: boolean;
    tag?: Tag;
    tileType?: TileType;
}

export interface Effect {
    addOrRemoveOneResource(resource: Resource, removeResourceCallback: Function): void;
    discardThenDraw(): void;
    drawCard(): void;
    gainResourceOption(options: Resource[][]): void;
    // A reference to the condition that triggered the effect.
    condition: Condition;
    gainResource(name: Resource, amount: number, target?: Card): void;
    increaseProduction(name: Resource, amount: number): void;
}

export enum Deck {
    BASIC,
    COLONIES,
    CORPORATE,
    PRELUDE,
    PROMO,
    VENUS
}

export enum Tag {
    ANIMAL,
    BUILDING,
    CITY,
    EARTH,
    ENERGY,
    EVENT,
    JOVIAN,
    MICROBE,
    PLANT,
    SCIENCE,
    SPACE,
    VENUS
}

export enum CardType {
    ACTIVE,
    AUTOMATED,
    CORPORATION,
    EVENT,
    PRELUDE
}
