import {Resource} from './resource';

export enum CellType {
  LAND,
  WATER
}

export enum TileType {
  GREENERY,
  CITY,
  OCEAN
}

class Tile {
  constructor(readonly owner: string, readonly type: TileType) {}
}

class Cell {
  tile?: Tile;
  constructor(readonly type: CellType, readonly bonus: Resource[] = []) {}
}

class Land extends Cell {
  constructor(bonus: Resource[] = []) {
    super(CellType.LAND, bonus);
  }
}

class Water extends Cell {
  constructor(bonus: Resource[] = []) {
    super(CellType.WATER, bonus);
  }
}

const land = (...props) => new Land(...props);
const water = (...props) => new Water(...props);

export const INITIAL_BOARD_STATE: Cell[][] = [
  [
    land([Resource.STEEL, Resource.STEEL]),
    water([Resource.STEEL, Resource.STEEL]),
    land(),
    water([Resource.CARD]),
    water()
  ],
  [
    land(),
    land([Resource.STEEL]),
    land(),
    land(),
    land(),
    water([Resource.CARD, Resource.CARD])
  ],
  [
    land([Resource.CARD]),
    land(),
    land(),
    land(),
    land(),
    land(),
    land([Resource.STEEL])
  ],
  [
    land([Resource.PLANT, Resource.TITANIUM]),
    land([Resource.PLANT]),
    land([Resource.PLANT]),
    land([Resource.PLANT]),
    land([Resource.PLANT, Resource.PLANT]),
    land([Resource.PLANT]),
    land([Resource.PLANT]),
    water([Resource.PLANT, Resource.PLANT])
  ],
  [
    land([Resource.PLANT, Resource.PLANT]),
    land([Resource.PLANT, Resource.PLANT]),
    land([Resource.PLANT, Resource.PLANT]),
    water([Resource.PLANT, Resource.PLANT]),
    water([Resource.PLANT, Resource.PLANT]),
    water([Resource.PLANT, Resource.PLANT]),
    land([Resource.PLANT, Resource.PLANT]),
    land([Resource.PLANT, Resource.PLANT]),
    land([Resource.PLANT, Resource.PLANT])
  ],
  [
    land([Resource.PLANT]),
    land([Resource.PLANT, Resource.PLANT]),
    land([Resource.PLANT]),
    land([Resource.PLANT]),
    land([Resource.PLANT]),
    water([Resource.PLANT]),
    water([Resource.PLANT]),
    water([Resource.PLANT])
  ],
  [land(), land(), land(), land(), land(), land([Resource.PLANT]), land()],
  [
    land([Resource.STEEL, Resource.STEEL]),
    land(),
    land([Resource.CARD]),
    land([Resource.CARD]),
    land(),
    land([Resource.TITANIUM])
  ],
  [
    land([Resource.STEEL]),
    land([Resource.STEEL, Resource.STEEL]),
    land(),
    land(),
    water([Resource.TITANIUM, Resource.TITANIUM])
  ]
];
