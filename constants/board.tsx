import {Resource} from './resource';

export enum CellType {
    LAND,
    WATER
}

export enum TileType {
    CAPITAL,
    CITY,
    ECOLOGICAL_ZONE,
    GREENERY,
    INDUSTRIAL_CENTER,
    LAND_CLAIM,
    LAVA_FLOW,
    MOHOLE_AREA,
    MINING,
    NATURAL_PRESERVE,
    NOCTIS,
    OCEAN,
    OTHER,
    RESTRICTED_AREA
}

export enum Location {
    CITY_ADJACENT,
    DOUBLE_CITY_ADJACENT,
    GANYMEDE,
    GREENERY_ADJACENT,
    ISOLATED,
    NOCTIS,
    NON_RESERVED,
    NOT_RESERVED_FOR_OCEAN,
    PHOBOS,
    RESERVED_FOR_OCEAN,
    STEEL_OR_TITANIUM,
    STEEL_OR_TITANIUM_PLAYER_ADJACENT,
    VOLCANIC
}

export enum Parameter {
    TEMPERATURE = 'temperature',
    OCEAN = 'ocean',
    OXYGEN = 'oxygen',
    VENUS = 'venus',
    TERRAFORM_RATING = 'terraformRating'
}

export interface TilePlacement {
    type: TileType;
    location?: Location;
    isRequired?: boolean;
}

export const t = (type: TileType, location?: Location): TilePlacement => ({
    type,
    location
});

const CURRENT_PLAYER = 'matt';

export class Tile {
    cell?: Cell;
    constructor(readonly owner: string, readonly type: TileType) {}

    get ownedByCurrentPlayer(): boolean {
        return this.owner === CURRENT_PLAYER;
    }
}

export class Cell {
    onMars: boolean = false;

    tile?: Tile;
    constructor(
        readonly type: CellType,
        readonly bonus: Resource[] = [],
        readonly location?: Location
    ) {}

    addTile(tile: Tile) {
        this.tile = tile;
        this.tile.cell = this;
    }
}

class Land extends Cell {
    constructor(bonus: Resource[] = [], location?: Location) {
        super(CellType.LAND, bonus, location);
    }
}

class Water extends Cell {
    constructor(bonus: Resource[] = [], location?: Location) {
        super(CellType.WATER, bonus, location);
    }
}

const land = (bonus?: Resource[], location?: Location): Land => new Land(bonus, location);
const water = (bonus?: Resource[]): Water => new Water(bonus);

export type Board = Cell[][];

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
        land([Resource.STEEL], Location.VOLCANIC),
        land(),
        land(),
        land(),
        water([Resource.CARD, Resource.CARD])
    ],
    [
        land([Resource.CARD], Location.VOLCANIC),
        land(),
        land(),
        land(),
        land(),
        land(),
        land([Resource.STEEL])
    ],
    [
        land([Resource.PLANT, Resource.TITANIUM], Location.VOLCANIC),
        land([Resource.PLANT]),
        land([Resource.PLANT]),
        land([Resource.PLANT]),
        land([Resource.PLANT, Resource.PLANT]),
        land([Resource.PLANT]),
        land([Resource.PLANT]),
        water([Resource.PLANT, Resource.PLANT])
    ],
    [
        land([Resource.PLANT, Resource.PLANT], Location.VOLCANIC),
        land([Resource.PLANT, Resource.PLANT]),
        land([Resource.PLANT, Resource.PLANT], Location.NOCTIS),
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

for (const row of INITIAL_BOARD_STATE) {
    for (const cell of row) {
        cell.onMars = true;
    }
}

INITIAL_BOARD_STATE.push([land([], Location.PHOBOS), land([], Location.GANYMEDE)]);
