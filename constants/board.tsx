import {Resource} from './resource';
import {RootState} from '../reducer';

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
    LAVA_FLOW,
    MOHOLE_AREA,
    MINING,
    NATURAL_PRESERVE,
    OCEAN,
    OTHER,
    RESTRICTED_AREA
}

// only set for certain cells
export enum SpecialLocation {
    GANYMEDE = 'ganymede',
    NOCTIS = 'noctis',
    PHOBOS = 'phobos',
    VOLCANIC = 'volcanic'
}
const RESERVED_LOCATIONS = [
    SpecialLocation.GANYMEDE,
    SpecialLocation.NOCTIS,
    SpecialLocation.PHOBOS
];

export enum PlacementRequirement {
    CITY, // normal city requirement (not touching another city)
    CITY_ADJACENT, // e.g. industrial center
    DOUBLE_CITY_ADJACENT, // e.g. urbanized area
    GANYMEDE,
    GREENERY, // normal greenery (next to existing city if possible)
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

export enum CellAttribute {
    HAS_STEEL,
    HAS_TITANIUM,
    RESERVED_FOR_OCEAN,
    RESERVED_FOR_CITY,
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

export class Tile {
    cell?: Cell;
    constructor(readonly ownerPlayerIndex: number, readonly type: TileType) {}
}

// export type Tile = {
//     cellId: number;
//     ownerPlayerIndex: number;
//     type: TileType;
// };

// export interface Cell {
//     tileId?: number;
//     coords?: [number, number];
//     landClaimedBy: number | null;
//     type: CellType;
//     bonus: Resource[];
//     specialLocation: SpecialLocation;
// }

export class Cell {
    tile?: Tile;
    coords?: [number, number]; // this should be set in the constructor, but we'll need to refactor the land and water helpers
    landClaimedBy: number | null;

    constructor(
        readonly type: CellType,
        readonly bonus: Resource[] = [],
        readonly specialLocation?: SpecialLocation
    ) {
        this.landClaimedBy = null;
    }
}

export const cellHelpers = {
    onMars(cell: Cell): boolean {
        return cell.type === CellType.LAND || cell.type === CellType.WATER;
    },

    containsCity(cell: Cell): boolean {
        return cell.tile?.type === TileType.CITY || cell.tile?.type === TileType.CAPITAL;
    },

    isEmpty(cell: Cell): boolean {
        return !cell.tile;
    },

    hasAttribute(cell: Cell, attribute: CellAttribute) {
        switch (attribute) {
            case CellAttribute.RESERVED_FOR_CITY:
                return cell.specialLocation && RESERVED_LOCATIONS.includes(cell.specialLocation);
            case CellAttribute.RESERVED_FOR_OCEAN:
                return cell.type === CellType.WATER;
            case CellAttribute.VOLCANIC:
                return cell.specialLocation && cell.specialLocation === SpecialLocation.VOLCANIC;
            case CellAttribute.HAS_STEEL:
                return cell.bonus.includes(Resource.STEEL);
            case CellAttribute.HAS_TITANIUM:
                return cell.bonus.includes(Resource.TITANIUM);
            default:
                return false;
        }
    }
};

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

const INITIAL_BOARD_STATE: Cell[][] = [
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

INITIAL_BOARD_STATE.forEach((row, rowIndex) => {
    row.forEach((cell, cellIndex) => {
        cell.coords = [rowIndex, cellIndex];
    });
});

export type Board = Cell[][];

export {INITIAL_BOARD_STATE};
