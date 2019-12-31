import {Resource} from './resource';
import {TileType} from './board';
import {ActionType, StandardProjectType} from './action';

export interface Card {
  actionOrEffectText?: string;
  addsResourceToCards?: Resource;
  cost?: number;
  deck: Deck;
  gainHeat?: number;
  gainMegacredit?: number;
  gainPlant?: number;
  gainSteel?: number;
  gainTitanium?: number;
  holdsResource?: Resource;
  name: string;
  ocean?: number;
  oneTimeText?: string;
  oxygen?: number;
  tags: Tag[];
  temperature?: number;
  type: CardType;
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
}

export interface Condition {
  card?: Card;
  tileType?: TileType;
  tag?: Tag;
  onMars?: boolean;
  samePlayer?: boolean;
  actionType?: ActionType;
  cost?: number;
  standardProjectType?: StandardProjectType;
  newTag?: boolean;
}

export interface Effect {
  // A reference to the condition that triggered the effect.
  condition: Condition;
  increaseProduction(name: Resource, amount: number): void;
  gainResource(name: Resource, amount: number): void;
  discardThenDraw(): void;
  gainOneResource(options: Resource[], target: Card): void;
  drawCard(): void;
  discardThenDraw(): void;
  addOrRemoveOneResource(resource: Resource, callback: Function): void;
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
