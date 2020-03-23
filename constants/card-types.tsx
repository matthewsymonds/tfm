import {Resource} from './resource';
import {Tile, TileType, TilePlacement, Parameter} from './board';
import {ActionType, StandardProjectType} from './action';

export interface Card {
    actionOrEffectText?: string;
    addsResourceToCards?: Resource;
    cost?: number;
    deck: Deck;
    holdsResource?: Resource;
    name: string;
    oneTimeText?: string;
    tags: Tag[];
    type: CardType;
    resources?: Resource[];
    requirement?(requirement: Requirement): boolean;
    requirementFailedMessage?: string;
    requiredAnimal?: number;
    requiredEarth?: number;
    requiredEnergy?: number;
    requiredJovian?: number;
    requiredMaxOcean?: number;
    requiredMaxOxygen?: number;
    requiredMaxTemperature?: number;
    requiredMaxVenus?: number;
    requiredMicrobe?: number;
    requiredOcean?: number;
    requiredOxygen?: number;
    requiredPlant?: number;
    requiredScience?: number;
    requiredSpace?: number;
    requiredTemperature?: number;
    requiredVenus?: number;
    requiredVenusTags?: number;
    terraformRatingIncrease?: number;
    venus?: number;
    victoryPoints?: number;
    condition?(condition: Condition): boolean;
    effect?(effect: Effect): void;
    oneTimeAction?(oneTimeAction: OneTimeAction): void;
    increaseProduction?: Resource[];
    decreaseProduction?: Resource[];
    decreaseAnyProduction?: Resource[];
    gainResource?: Resource[];
    removeResource?: Resource[];
    removeAnyResource?: Resource[];
    gainResourceOption?: Resource[][];
    removeAnyResourceOption?: Resource[][];
    increaseProductionOption?: Resource[][];
    loseAnyResourceOption?: Resource[][];
    placeTile?: TilePlacement[];
    increaseParameter?: Parameter[];
    state?: State;
    ownedByCurrentPlayer?: boolean;
}

interface State {
    tags: Tag[];
    cards: Card[];
}

interface OneTimeAction {
    increaseProduction(resource: Resource, amount?: number): void;
    duplicateBuildingTagProduction(): void;
    tags: Tag[];
}

interface VictoryPointsCondition {
    tags: Tag[];
}

type VictoryPoints = (condition: VictoryPointsCondition) => number;

export interface Condition {
    actionType?: ActionType;
    card?: Card;
    cost?: number;
    newTag?: boolean;
    onMars?: boolean;
    samePlayer?: boolean;
    standardProjectType?: StandardProjectType;
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

export interface Requirement {
    plants: number;
    steelProduction: number;
    titaniumProduction: number;
    energyProduction: number;
    megacreditProduction: number;
    tiles: Tile[];
}

export enum Deck {
    Basic,
    Colonies,
    Corporate,
    Prelude,
    Promo,
    Venus
}

export enum Tag {
    Animal,
    Building,
    City,
    Earth,
    Energy,
    Event,
    Jovian,
    Microbe,
    Plant,
    Science,
    Space,
    Venus
}

export enum CardType {
    Active,
    Automated,
    Corporation,
    Event,
    Prelude
}
