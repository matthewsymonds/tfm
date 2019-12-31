import {Resource} from './resource';

export enum CellType {
  Land,
  Water
}

export enum TileType {
  Greenery,
  City,
  Ocean,
  Other
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
    super(CellType.Land, bonus);
  }
}

class Water extends Cell {
  constructor(bonus: Resource[] = []) {
    super(CellType.Water, bonus);
  }
}

const land = (bonus?: Resource[]): Land => new Land(bonus);
const water = (bonus?: Resource[]): Water => new Water(bonus);

export const INITIAL_BOARD_STATE: Cell[][] = [
  [
    land([Resource.Steel, Resource.Steel]),
    water([Resource.Steel, Resource.Steel]),
    land(),
    water([Resource.Card]),
    water()
  ],
  [
    land(),
    land([Resource.Steel]),
    land(),
    land(),
    land(),
    water([Resource.Card, Resource.Card])
  ],
  [
    land([Resource.Card]),
    land(),
    land(),
    land(),
    land(),
    land(),
    land([Resource.Steel])
  ],
  [
    land([Resource.Plant, Resource.Titanium]),
    land([Resource.Plant]),
    land([Resource.Plant]),
    land([Resource.Plant]),
    land([Resource.Plant, Resource.Plant]),
    land([Resource.Plant]),
    land([Resource.Plant]),
    water([Resource.Plant, Resource.Plant])
  ],
  [
    land([Resource.Plant, Resource.Plant]),
    land([Resource.Plant, Resource.Plant]),
    land([Resource.Plant, Resource.Plant]),
    water([Resource.Plant, Resource.Plant]),
    water([Resource.Plant, Resource.Plant]),
    water([Resource.Plant, Resource.Plant]),
    land([Resource.Plant, Resource.Plant]),
    land([Resource.Plant, Resource.Plant]),
    land([Resource.Plant, Resource.Plant])
  ],
  [
    land([Resource.Plant]),
    land([Resource.Plant, Resource.Plant]),
    land([Resource.Plant]),
    land([Resource.Plant]),
    land([Resource.Plant]),
    water([Resource.Plant]),
    water([Resource.Plant]),
    water([Resource.Plant])
  ],
  [land(), land(), land(), land(), land(), land([Resource.Plant]), land()],
  [
    land([Resource.Steel, Resource.Steel]),
    land(),
    land([Resource.Card]),
    land([Resource.Card]),
    land(),
    land([Resource.Titanium])
  ],
  [
    land([Resource.Steel]),
    land([Resource.Steel, Resource.Steel]),
    land(),
    land(),
    water([Resource.Titanium, Resource.Titanium])
  ]
];
