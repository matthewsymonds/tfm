import {Resource} from './resource';

export enum CellType {
    Land,
    Water
}

export enum TileType {
    Capital,
    City,
    EcologicalZone,
    Greenery,
    IndustrialCenter,
    LandClaim,
    LavaFlow,
    MoholeArea,
    Mining,
    MiningAdjacent,
    NaturalPreserve,
    Noctis,
    Ocean,
    Other,
    RestrictedArea
}

export enum Location {
    CityAdjacent,
    DoubleCityAdjacent,
    Ganymede,
    GreeneryAdjacent,
    Isolated,
    Noctis,
    NonReserved,
    NotReservedForOcean,
    Phobos,
    ReservedForOcean,
    SteelOrTitanium,
    SteelOrTitaniumPlayerAdjacent,
    Volcanic
}

export enum Parameter {
    Temperature,
    Ocean,
    Oxygen,
    TerraformRating
}

export interface TilePlacement {
    type: TileType;
    location?: Location;
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

class Cell {
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
        super(CellType.Land, bonus, location);
    }
}

class Water extends Cell {
    constructor(bonus: Resource[] = [], location?: Location) {
        super(CellType.Water, bonus, location);
    }
}

const land = (bonus?: Resource[], location?: Location): Land => new Land(bonus, location);
const water = (bonus?: Resource[]): Water => new Water(bonus);

export type Board = Cell[][];

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
        land([Resource.Steel], Location.Volcanic),
        land(),
        land(),
        land(),
        water([Resource.Card, Resource.Card])
    ],
    [
        land([Resource.Card], Location.Volcanic),
        land(),
        land(),
        land(),
        land(),
        land(),
        land([Resource.Steel])
    ],
    [
        land([Resource.Plant, Resource.Titanium], Location.Volcanic),
        land([Resource.Plant]),
        land([Resource.Plant]),
        land([Resource.Plant]),
        land([Resource.Plant, Resource.Plant]),
        land([Resource.Plant]),
        land([Resource.Plant]),
        water([Resource.Plant, Resource.Plant])
    ],
    [
        land([Resource.Plant, Resource.Plant], Location.Volcanic),
        land([Resource.Plant, Resource.Plant]),
        land([Resource.Plant, Resource.Plant], Location.Noctis),
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

for (const row of INITIAL_BOARD_STATE) {
    for (const cell of row) {
        cell.onMars = true;
    }
}

INITIAL_BOARD_STATE.push([land([], Location.Phobos), land([], Location.Ganymede)]);
