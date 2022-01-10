import {Action} from './action';
import {Resource} from './resource-enum';

export enum CellType {
    LAND,
    WATER,
    OFF_MARS, // e.g. ganymede
}

export enum TileType {
    CAPITAL = 'CAPITAL',
    CITY = 'CITY',
    COMMERCIAL_DISTRICT = 'COMMERCIAL_DISTRICT',
    ECOLOGICAL_ZONE = 'ECOLOGICAL_ZONE',
    GREENERY = 'GREENERY',
    INDUSTRIAL_CENTER = 'INDUSTRIAL_CENTER',
    LAND_CLAIM = 'LAND_CLAIM',
    LAVA_FLOW = 'LAVA_FLOW',
    MOHOLE_AREA = 'MOHOLE_AREA',
    MINING_RIGHTS = 'MINING_RIGHTS',
    NATURAL_PRESERVE = 'NATURAL_PRESERVE',
    NUCLEAR_ZONE = 'NUCLEAR_ZONE',
    OCEAN = 'OCEAN',
    OTHER = 'OTHER',
    RESTRICTED_AREA = 'RESTRICTED_AREA',
    MINING_AREA = 'MINING_AREA',
    ANY_TILE = 'ANY_TILE',
}

// only set for certain cells
export enum SpecialLocation {
    GANYMEDE = 'ganymede',
    NOCTIS = 'noctis',
    PHOBOS = 'phobos',
    VOLCANIC = 'volcanic',
    DAWN_CITY = 'dawnCity',
    LUNA_METROPOLIS = 'lunaMetropolis',
    MAXWELL_BASE = 'maxwellBase',
    STRATOPOLIS = 'stratopolis',
}
export const RESERVED_LOCATIONS = [
    SpecialLocation.GANYMEDE,
    SpecialLocation.NOCTIS,
    SpecialLocation.PHOBOS,
    SpecialLocation.DAWN_CITY,
    SpecialLocation.LUNA_METROPOLIS,
    SpecialLocation.MAXWELL_BASE,
    SpecialLocation.STRATOPOLIS,
];

export enum PlacementRequirement {
    CITY = 'placementCity', // normal city requirement (not touching another city)
    CITY_ADJACENT = 'placementCityAdjacent', // e.g. industrial center
    DAWN_CITY = 'dawnCity',
    DOUBLE_CITY_ADJACENT = 'placementDoubleCityAdjacent', // e.g. urbanized area
    GANYMEDE = 'placementGanymede',
    GREENERY = 'placementGreenery', // normal greenery (next to existing city if possible)
    GREENERY_ADJACENT = 'placementGreeneryAdjacent',
    ISOLATED = 'placementIsolated',
    LUNA_METROPOLIS = 'lunaMetropolis',
    MAXWELL_BASE = 'maxwellBase',
    NOCTIS = 'placementNoctis',
    NON_RESERVED = 'placementNonReserved',
    NOT_RESERVED_FOR_OCEAN = 'placementNotReservedForOcean',
    PHOBOS = 'placementPhobos',
    RESERVED_FOR_OCEAN = 'placementReservedForOcean',
    STEEL_OR_TITANIUM = 'placementSteelOrTitanium',
    STEEL_OR_TITANIUM_PLAYER_ADJACENT = 'placementSteelOrTitaniumPlayerAdjacent',
    STRATOPOLIS = 'stratopolis',
    VOLCANIC = 'placementVolcanic',
    VOLCANIC_CITY = 'placementVolcanicCity',
}

export const getTileIcon = (type: TileType) => {
    switch (type) {
        case TileType.CAPITAL:
        case TileType.CITY:
            return '🏙️';
        case TileType.COMMERCIAL_DISTRICT:
            return '$';
        case TileType.ECOLOGICAL_ZONE:
            return '🐾';
        case TileType.GREENERY:
            return '🌳';
        case TileType.INDUSTRIAL_CENTER:
            return '🏭';
        case TileType.LAVA_FLOW:
            return '🌋';
        case TileType.MINING_RIGHTS:
        case TileType.MINING_AREA:
            return '⛏️';
        case TileType.MOHOLE_AREA:
            return '🕳️';
        case TileType.NATURAL_PRESERVE:
            return '♂️';
        case TileType.NUCLEAR_ZONE:
            return '☢️';
        case TileType.OCEAN:
            return '🌊';
        case TileType.OTHER:
            return '?';
        case TileType.RESTRICTED_AREA:
            return '🚫';
        default:
            return '?';
    }
};

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
}

export function getParameterName(parameter: Parameter) {
    switch (parameter) {
        case Parameter.TEMPERATURE:
            return 'temperature';
        case Parameter.OCEAN:
            return 'ocean';
        case Parameter.OXYGEN:
            return 'oxygen';
        case Parameter.VENUS:
            return 'Venus';
    }
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
    noBonuses?: boolean;
};

const DEFAULT_PLACEMENT_REQUIREMENTS = {
    [TileType.OCEAN]: PlacementRequirement.RESERVED_FOR_OCEAN,
    [TileType.GREENERY]: PlacementRequirement.GREENERY,
    [TileType.CITY]: PlacementRequirement.CITY,
};

export const t = (
    type: TileType,
    placementRequirement: PlacementRequirement = DEFAULT_PLACEMENT_REQUIREMENTS[type],
    isRequired: boolean = true
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
    action?: Action;
    specialLocation?: SpecialLocation;
    specialName?: string;
};

const VALID_CITY_TYPES: Array<TileType | undefined> = [TileType.CITY, TileType.CAPITAL];

export function hasCity(cell: Cell): boolean {
    return VALID_CITY_TYPES.includes(cell?.tile?.type);
}

export const cellHelpers = {
    onMars(cell: Cell): boolean {
        return cell.type === CellType.LAND || cell.type === CellType.WATER;
    },

    containsCity(cell: Cell): boolean {
        return hasCity(cell);
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

const ELYSIUM: Cell[][] = [
    [
        water(),
        water([Resource.TITANIUM]),
        water([Resource.CARD]),
        water([Resource.STEEL]),
        land([Resource.CARD]),
    ],
    [
        land([Resource.TITANIUM], SpecialLocation.VOLCANIC, 'Hecatus Tholus'),
        land(),
        land(),
        water(),
        water(),
        land([Resource.STEEL, Resource.STEEL]),
    ],
    [
        land([Resource.TITANIUM, Resource.TITANIUM], SpecialLocation.VOLCANIC, 'Elysium Mons'),
        land(),
        land([Resource.CARD]),
        land(),
        water([Resource.PLANT]),
        water(),
        land(
            [Resource.CARD, Resource.CARD, Resource.CARD],
            SpecialLocation.VOLCANIC,
            'Olympus Mons'
        ),
    ],
    [
        land([Resource.PLANT]),
        land([Resource.PLANT]),
        land([Resource.PLANT]),
        water([Resource.PLANT, Resource.PLANT]),
        land([Resource.PLANT]),
        water([Resource.PLANT]),
        water([Resource.PLANT]),
        land([Resource.STEEL, Resource.PLANT]),
    ],
    [
        land([Resource.PLANT, Resource.PLANT]),
        land([Resource.PLANT, Resource.PLANT]),
        land([Resource.PLANT, Resource.PLANT]),
        water([Resource.PLANT, Resource.PLANT]),
        land([Resource.PLANT, Resource.PLANT]),
        land([Resource.PLANT, Resource.PLANT, Resource.PLANT]),
        land([Resource.PLANT, Resource.PLANT]),
        land([Resource.PLANT, Resource.PLANT]),
        land([Resource.PLANT, Resource.TITANIUM], SpecialLocation.VOLCANIC, 'Arsia Mons'),
    ],
    [
        land([Resource.STEEL]),
        land([Resource.PLANT]),
        land([Resource.PLANT]),
        land([Resource.PLANT]),
        land([Resource.PLANT]),
        land([Resource.PLANT]),
        land([Resource.PLANT]),
        land(),
    ],
    [
        land([Resource.TITANIUM]),
        land([Resource.STEEL]),
        land(),
        land(),
        land([Resource.STEEL]),
        land(),
        land(),
    ],
    [
        land([Resource.STEEL, Resource.STEEL]),
        land(),
        land(),
        land(),
        land([Resource.STEEL, Resource.STEEL]),
        land(),
    ],
    [
        land([Resource.STEEL]),
        land(),
        land([Resource.CARD]),
        land([Resource.CARD]),
        land([Resource.STEEL, Resource.STEEL]),
    ],
];

const HELLAS: Cell[][] = [
    [
        water([Resource.PLANT, Resource.PLANT]),
        land([Resource.PLANT, Resource.PLANT]),
        land([Resource.PLANT, Resource.PLANT]),
        land([Resource.PLANT, Resource.STEEL]),
        land([Resource.PLANT]),
    ],
    [
        water([Resource.PLANT, Resource.PLANT]),
        land([Resource.PLANT, Resource.PLANT]),
        land([Resource.PLANT]),
        land([Resource.PLANT, Resource.STEEL]),
        land([Resource.PLANT]),
        land([Resource.PLANT]),
    ],
    [
        water([Resource.PLANT]),
        land([Resource.PLANT]),
        land([Resource.STEEL]),
        land([Resource.STEEL]),
        land(),
        land([Resource.PLANT, Resource.PLANT]),
        land([Resource.PLANT, Resource.CARD]),
    ],
    [
        water([Resource.PLANT]),
        land([Resource.PLANT]),
        land([Resource.STEEL]),
        land([Resource.STEEL, Resource.STEEL]),
        land([Resource.STEEL]),
        water([Resource.PLANT]),
        water([Resource.PLANT]),
        land([Resource.PLANT]),
    ],
    [
        land([Resource.CARD]),
        land(),
        land(),
        land([Resource.STEEL, Resource.STEEL]),
        land(),
        water([Resource.CARD]),
        water([Resource.HEAT, Resource.HEAT, Resource.HEAT]),
        water(),
        land([Resource.PLANT]),
    ],
    [
        land([Resource.TITANIUM]),
        land(),
        land([Resource.STEEL]),
        land(),
        land(),
        water(),
        water([Resource.STEEL]),
        land(),
    ],
    [
        water([Resource.TITANIUM, Resource.TITANIUM]),
        land(),
        land(),
        land([Resource.CARD]),
        land(),
        land(),
        land([Resource.TITANIUM]),
    ],
    [
        land([Resource.STEEL]),
        land([Resource.CARD]),
        land([Resource.HEAT, Resource.HEAT]),
        land([Resource.HEAT, Resource.HEAT]),
        land([Resource.TITANIUM]),
        land([Resource.TITANIUM]),
    ],
    [
        land(),
        land([Resource.HEAT, Resource.HEAT]),
        {
            type: CellType.LAND,
            action: {
                removeResource: {
                    [Resource.MEGACREDIT]: 6,
                },
                tilePlacements: [t(TileType.OCEAN)],
            },
        },
        land([Resource.HEAT, Resource.HEAT]),
        land(),
    ],
];

const OFF_MARS_CITIES = [
    offMars([], SpecialLocation.PHOBOS, 'Phobos'),
    offMars([], SpecialLocation.GANYMEDE, 'Ganymede'),
    offMars([], SpecialLocation.DAWN_CITY, 'Dawn City'),
    offMars([], SpecialLocation.LUNA_METROPOLIS, 'Luna Metropolis'),
    offMars([], SpecialLocation.MAXWELL_BASE, 'Maxwell Base'),
    offMars([], SpecialLocation.STRATOPOLIS, 'Stratopolis'),
];

INITIAL_BOARD_STATE.push(OFF_MARS_CITIES);

ELYSIUM.push(OFF_MARS_CITIES);

HELLAS.push(OFF_MARS_CITIES);

[INITIAL_BOARD_STATE, ELYSIUM, HELLAS].forEach(board =>
    board.forEach((row, rowIndex) => {
        row.forEach((cell, cellIndex) => {
            cell.coords = [rowIndex, cellIndex];
        });
    })
);

export function getTilePlacementBonus(
    cell: Cell,
    tilePlacement: TilePlacement
): Array<{resource: Resource; amount: number}> {
    if (tilePlacement.noBonuses) return [];
    const bonuses = cell.bonus || [];
    const uniqueBonuses = new Set(bonuses);

    return [...uniqueBonuses].map(bonus => {
        return {
            resource: bonus,
            amount: bonuses.filter(b => b === bonus).length,
        };
    });
}

export function getBoard(name?: string): Cell[][] {
    if (name === 'Hellas') {
        return HELLAS;
    }
    if (name === 'Elysium') {
        return ELYSIUM;
    }

    return INITIAL_BOARD_STATE;
}

export type Board = Cell[][];

export {INITIAL_BOARD_STATE, ELYSIUM, HELLAS};
