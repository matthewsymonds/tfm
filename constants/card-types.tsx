import {Resource} from './resource';

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
