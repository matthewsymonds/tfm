import {Resource} from './resource';

export enum CellType {
    LAND,
    WATER,
    OFF_MARS, // e.g. ganymede
}

export enum TileType {
    CAPITAL,
    CITY,
    COMMERCIAL_DISTRICT,
    ECOLOGICAL_ZONE,
    GREENERY,
    INDUSTRIAL_CENTER,
    LAVA_FLOW,
    MOHOLE_AREA,
    MINING_RIGHTS,
    NATURAL_PRESERVE,
    NUCLEAR_ZONE,
    OCEAN,
    OTHER,
    RESTRICTED_AREA,
    MINING_AREA,
}

// only set for certain cells
export enum SpecialLocation {
    GANYMEDE = 'ganymede',
    NOCTIS = 'noctis',
    PHOBOS = 'phobos',
    VOLCANIC = 'volcanic',
}
export const RESERVED_LOCATIONS = [
    SpecialLocation.GANYMEDE,
    SpecialLocation.NOCTIS,
    SpecialLocation.PHOBOS,
];

export enum Milestone {
    TERRAFORMER = 'terraformer',
    MAYOR = 'mayor',
    GARDENER = 'gardener',
    BUILDER = 'builder',
    PLANNER = 'planner',
}

export enum Award {
    LANDLORD = 'landlord',
    BANKER = 'banker',
    SCIENTIST = 'scientist',
    THERMALIST = 'thermalist',
    MINER = 'miner',
}

export enum PlacementRequirement {
    CITY = 'placementCity', // normal city requirement (not touching another city)
    CITY_ADJACENT = 'placementCityAdjacemt', // e.g. industrial center
    DOUBLE_CITY_ADJACENT = 'placementDoubleCityAdjacent', // e.g. urbanized area
    GANYMEDE = 'placementGanymede',
    GREENERY = 'placementGreenery', // normal greenery (next to existing city if possible)
    GREENERY_ADJACENT = 'placementGreeneryAdjacent',
    ISOLATED = 'placementIsolated',
    NOCTIS = 'placementNoctis',
    NON_RESERVED = 'placementNonReserved',
    NOT_RESERVED_FOR_OCEAN = 'placementNotReservedForOcean',
    PHOBOS = 'placementPhobos',
    RESERVED_FOR_OCEAN = 'placementReservedForOcean',
    STEEL_OR_TITANIUM = 'placementSteelOrTitanium',
    STEEL_OR_TITANIUM_PLAYER_ADJACENT = 'placementSteelOrTitaniumPlayerAdjacent',
    VOLCANIC = 'placementVolcanic',
}

export enum CellAttribute {
    HAS_STEEL,
    HAS_TITANIUM,
    RESERVED_FOR_OCEAN,
    RESERVED_FOR_CITY,
    VOLCANIC,
}

export enum Parameter {
    TEMPERATURE = 'temperature',
    OCEAN = 'ocean',
    OXYGEN = 'oxygen',
    VENUS = 'venus',
    TERRAFORM_RATING = 'terraformRating',
}

export type GlobalParameters = {
    [Parameter.TEMPERATURE]: number;
    [Parameter.OCEAN]: number;
    [Parameter.OXYGEN]: number;
    [Parameter.VENUS]: number;
};

export type TilePlacement = {
    type: TileType;
    placementRequirement: PlacementRequirement;
    // By default, cards can be played even if the tile they would place cannot be played.
    // This behavior is overridden for asterisked cards (e.g. Urbanized Area).
    isRequired: boolean;
};

const DEFAULT_PLACEMENT_REQUIREMENTS = {
    [TileType.OCEAN]: PlacementRequirement.RESERVED_FOR_OCEAN,
    [TileType.GREENERY]: PlacementRequirement.GREENERY,
    [TileType.CITY]: PlacementRequirement.CITY,
};

export const t = (
    type: TileType,
    placementRequirement: PlacementRequirement = DEFAULT_PLACEMENT_REQUIREMENTS[type],
    isRequired: boolean = false
): TilePlacement => ({
    type,
    placementRequirement,
    isRequired,
});

export type Tile = {
    ownerPlayerIndex?: number;
    type: TileType;
};

export type Cell = {
    type: CellType;
    tile?: Tile;
    coords?: [number, number];
    landClaimedBy?: number;
    bonus?: Resource[];
    specialLocation?: SpecialLocation;
    specialName?: string;
};

export const cellHelpers = {
    onMars(cell: Cell): boolean {
        return cell.type === CellType.LAND || cell.type === CellType.WATER;
    },

    isOwnedBy(cell: Cell, playerIndex: number) {
        return cell.tile && cell.tile.ownerPlayerIndex === playerIndex;
    },

    containsCity(cell: Cell): boolean {
        return cell.tile?.type === TileType.CITY || cell.tile?.type === TileType.CAPITAL;
    },

    containsGreenery(cell: Cell): boolean {
        return cell.tile?.type === TileType.GREENERY;
    },

    isEmpty(cell: Cell): boolean {
        return !cell.tile;
    },

    hasAttribute(cell: Cell, attribute: CellAttribute): boolean {
        switch (attribute) {
            case CellAttribute.RESERVED_FOR_CITY:
                return (
                    (cell.specialLocation && RESERVED_LOCATIONS.includes(cell.specialLocation)) ??
                    false
                );
            case CellAttribute.RESERVED_FOR_OCEAN:
                return cell.type === CellType.WATER;
            case CellAttribute.VOLCANIC:
                return (
                    (cell.specialLocation && cell.specialLocation === SpecialLocation.VOLCANIC) ??
                    false
                );
            case CellAttribute.HAS_STEEL:
                return cell.bonus?.includes(Resource.STEEL) ?? false;
            case CellAttribute.HAS_TITANIUM:
                return cell.bonus?.includes(Resource.TITANIUM) ?? false;
            default:
                return false;
        }
    },
};

const land = (
    bonus?: Resource[],
    specialLocation?: SpecialLocation,
    specialName?: string
): Cell => ({
    type: CellType.LAND,
    bonus,
    specialLocation,
    specialName,
});
const water = (bonus?: Resource[]): Cell => ({
    type: CellType.WATER,
    bonus,
});
const offMars = (
    bonus?: Resource[],
    specialLocation?: SpecialLocation,
    specialName?: string
): Cell => ({
    type: CellType.OFF_MARS,
    bonus,
    specialName,
    specialLocation,
});

const INITIAL_BOARD_STATE: Cell[][] = [
    [
        land([Resource.STEEL, Resource.STEEL]),
        water([Resource.STEEL, Resource.STEEL]),
        land(),
        water([Resource.CARD]),
        water(),
    ],
    [
        land(),
        land([Resource.STEEL], SpecialLocation.VOLCANIC, 'Tharsis Tholus'),
        land(),
        land(),
        land(),
        water([Resource.CARD, Resource.CARD]),
    ],
    [
        land([Resource.CARD], SpecialLocation.VOLCANIC, 'Ascraeus Mons'),
        land(),
        land(),
        land(),
        land(),
        land(),
        land([Resource.STEEL]),
    ],
    [
        land([Resource.PLANT, Resource.TITANIUM], SpecialLocation.VOLCANIC, 'Pavonis Mons'),
        land([Resource.PLANT]),
        land([Resource.PLANT]),
        land([Resource.PLANT]),
        land([Resource.PLANT, Resource.PLANT]),
        land([Resource.PLANT]),
        land([Resource.PLANT]),
        water([Resource.PLANT, Resource.PLANT]),
    ],
    [
        land([Resource.PLANT, Resource.PLANT], SpecialLocation.VOLCANIC, 'Arsia Mons'),
        land([Resource.PLANT, Resource.PLANT]),
        land([Resource.PLANT, Resource.PLANT], SpecialLocation.NOCTIS, 'Noctis City'),
        water([Resource.PLANT, Resource.PLANT]),
        water([Resource.PLANT, Resource.PLANT]),
        water([Resource.PLANT, Resource.PLANT]),
        land([Resource.PLANT, Resource.PLANT]),
        land([Resource.PLANT, Resource.PLANT]),
        land([Resource.PLANT, Resource.PLANT]),
    ],
    [
        land([Resource.PLANT]),
        land([Resource.PLANT, Resource.PLANT]),
        land([Resource.PLANT]),
        land([Resource.PLANT]),
        land([Resource.PLANT]),
        water([Resource.PLANT]),
        water([Resource.PLANT]),
        water([Resource.PLANT]),
    ],
    [land(), land(), land(), land(), land(), land([Resource.PLANT]), land()],
    [
        land([Resource.STEEL, Resource.STEEL]),
        land(),
        land([Resource.CARD]),
        land([Resource.CARD]),
        land(),
        land([Resource.TITANIUM]),
    ],
    [
        land([Resource.STEEL]),
        land([Resource.STEEL, Resource.STEEL]),
        land(),
        land(),
        water([Resource.TITANIUM, Resource.TITANIUM]),
    ],
];

INITIAL_BOARD_STATE.push([
    offMars([], SpecialLocation.PHOBOS, 'Phobos Space Haven'),
    offMars([], SpecialLocation.GANYMEDE, 'Ganymede Colony'),
]);

INITIAL_BOARD_STATE.forEach((row, rowIndex) => {
    row.forEach((cell, cellIndex) => {
        cell.coords = [rowIndex, cellIndex];
    });
});

export type Board = Cell[][];

export {INITIAL_BOARD_STATE};
