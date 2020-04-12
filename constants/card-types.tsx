import {Resource} from './resource';
import {Tile, TileType, TilePlacement, Parameter} from './board';
import {ActionType, StandardProjectType} from './action';

type MinimumGlobalParameter = {
    type: Parameter;
    min: number;
    max: undefined;
};

type MaximumGlobalParameter = {
    type: Parameter;
    min: undefined;
    max: number;
};

export type RequiredGlobalParameter = MinimumGlobalParameter | MaximumGlobalParameter;

interface CardRequirement {
    cost?: number;
    requiredGlobalParameter?: RequiredGlobalParameter;
    minColonies?: number;
    maxColonies?: number; // only for colonies expansion
    minTerraformRating?: number;
    requiredProduction?: Resource; // e.g. Asteroid Mining Consortium
    requiredTags?: Tag[];
    requiredResources?: Resource[];

    removeResources?: Resource[];
    decreaseProduction?: Resource[];
    decreaseAnyProduction?: Resource[];
}

type CardActionRequirement = {
    canPayWith: Resource[];
    canPayFromOtherCards?: boolean; // e.g. predators, ants
};

export type CardAction = {
    playlist: ReduxAction[];
    requirement?: CardActionRequirement;
};

export type ReduxAction = {
    type: string;
    payload: any;
};

export interface CardConfig extends CardRequirement {
    cardActions?: CardAction[];
    resources?: Resource[];
    usedActionThisRound?: boolean;
    actionOrEffectText?: string;
    deck: Deck;
    holdsResource?: Resource;
    name: string;
    oneTimeText?: string;
    tags: Tag[];
    type: CardType;
    playlist?: ReduxAction[];
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
    increaseTerraformRating?: number;

    // ????
    state?: State;
    ownedByCurrentPlayer?: boolean;
}

export interface State {
    tags: Tag[];
    cards: CardConfig[];
}

export type Condition = {
    actionType?: ActionType;
    card?: CardConfig;
    cost?: number;
    newTag?: boolean;
    onMars?: boolean;
    samePlayer?: boolean;
    tag?: Tag;
    tileType?: TileType;
};

export interface Effect {
    addOrRemoveOneResource(resource: Resource, removeResourcesCallback: Function): void;
    discardThenDraw(): void;
    drawCard(): void;
    gainResourceOption(options: Resource[][]): void;
    // A reference to the condition that triggered the effect.
    condition: Condition;
    gainResource(name: Resource, amount: number, target?: CardConfig): void;
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
    ANIMAL = 'tagAnimal',
    BUILDING = 'tagBuilding',
    CITY = 'tagCity',
    EARTH = 'tagEarth',
    EVENT = 'tagEvent',
    JOVIAN = 'tagJovian',
    MICROBE = 'tagMicrobe',
    PLANT = 'tagPlant',
    POWER = 'tagPower',
    SCIENCE = 'tagScience',
    SPACE = 'tagSpace',
    VENUS = 'tagVenus'
}

export enum CardType {
    ACTIVE,
    AUTOMATED,
    CORPORATION,
    EVENT,
    PRELUDE
}
