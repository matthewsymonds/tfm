import {Tag} from './tag';

export type CardDiscounts = {
    [Tag.SPACE]: number;
    [Tag.EARTH]: number;
};

export type TagDiscounts = {
    [Tag.SPACE]: number;
    [Tag.VENUS]: number;
    [Tag.BUILDING]: number;
    [Tag.SCIENCE]: number;
    [Tag.EARTH]: number;
    [Tag.POWER]: number;
};

export type Discounts = {
    card: number;
    tags: TagDiscounts;
    cards: CardDiscounts;
    standardProjects: number;
    standardProjectPowerPlant: number;
    nextCardThisGeneration: number;
    trade: number;
};
