import {Resource} from './resource';

export enum CellType {
    LAND,
    WATER,
    OFF_MARS // e.g. ganymede
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

// only set for certain cells
export enum SpecialLocation {
    GANYMEDE,
    NOCTIS,
    PHOBOS,
    VOLCANIC
}

export enum PlacementRequirement {
    CITY_NON_ADJACENT,
    CITY_ADJACENT,
    GANYMEDE,
    DOUBLE_CITY_ADJACENT,
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
    placementRequirement: PlacementRequirement;
    // By default, cards can be played even if the tile they would place cannot be played.
    // This behavior is overridden for asterisked cards (e.g. Urbanized Area).
    isRequired: boolean;
}

export const t = (
    type: TileType,
    placementRequirement: PlacementRequirement,
    isRequired: boolean = false
): TilePlacement => ({
    type,
    placementRequirement,
    isRequired
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
    tile?: Tile;
    constructor(
        readonly type: CellType,
        readonly bonus: Resource[] = [],
        readonly specialLocation?: SpecialLocation
    ) {}

    addTile(tile: Tile) {
        this.tile = tile;
        this.tile.cell = this;
    }

    get onMars(): boolean {
        return this.type === CellType.LAND || this.type === CellType.WATER;
    }
}

class Land extends Cell {
    constructor(bonus: Resource[] = [], specialLocation?: SpecialLocation) {
        super(CellType.LAND, bonus, specialLocation);
    }
}

class Water extends Cell {
    constructor(bonus: Resource[] = [], specialLocation?: SpecialLocation) {
        super(CellType.WATER, bonus, specialLocation);
    }
}

class OffMars extends Cell {
    constructor(bonus: Resource[] = [], specialLocation?: SpecialLocation) {
        super(CellType.OFF_MARS, bonus, specialLocation);
    }
}

const land = (bonus?: Resource[], specialLocation?: SpecialLocation): Land =>
    new Land(bonus, specialLocation);
const water = (bonus?: Resource[]): Water => new Water(bonus);
const offMars = (bonus?: Resource[], specialLocation?: SpecialLocation): OffMars =>
    new OffMars(bonus, specialLocation);

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
        land([Resource.STEEL], SpecialLocation.VOLCANIC),
        land(),
        land(),
        land(),
        water([Resource.CARD, Resource.CARD])
    ],
    [
        land([Resource.CARD], SpecialLocation.VOLCANIC),
        land(),
        land(),
        land(),
        land(),
        land(),
        land([Resource.STEEL])
    ],
    [
        land([Resource.PLANT, Resource.TITANIUM], SpecialLocation.VOLCANIC),
        land([Resource.PLANT]),
        land([Resource.PLANT]),
        land([Resource.PLANT]),
        land([Resource.PLANT, Resource.PLANT]),
        land([Resource.PLANT]),
        land([Resource.PLANT]),
        water([Resource.PLANT, Resource.PLANT])
    ],
    [
        land([Resource.PLANT, Resource.PLANT], SpecialLocation.VOLCANIC),
        land([Resource.PLANT, Resource.PLANT]),
        land([Resource.PLANT, Resource.PLANT], SpecialLocation.NOCTIS),
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

INITIAL_BOARD_STATE.push([
    offMars([], SpecialLocation.PHOBOS),
    offMars([], SpecialLocation.GANYMEDE)
]);
