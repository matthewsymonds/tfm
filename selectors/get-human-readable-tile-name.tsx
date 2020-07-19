import {TileType} from 'constants/board';

export function getHumanReadableTileName(type: TileType): string {
    return (
        {
            [TileType.CAPITAL]: 'Capital',
            [TileType.CITY]: 'city',
            [TileType.COMMERCIAL_DISTRICT]: 'Commercial District',
            [TileType.ECOLOGICAL_ZONE]: 'Ecological Zone',
            [TileType.GREENERY]: 'greenery',
            [TileType.INDUSTRIAL_CENTER]: 'Industrial Center',
            [TileType.LAVA_FLOW]: 'Lava Flow',
            [TileType.MINING_RIGHTS]: 'Mining',
            [TileType.MINING_AREA]: 'Mining',
            [TileType.MOHOLE_AREA]: 'Mohole Area',
            [TileType.NATURAL_PRESERVE]: 'Natural Preserve',
            [TileType.NUCLEAR_ZONE]: 'Nuclear Zone',
            [TileType.OCEAN]: 'ocean',
            [TileType.OTHER]: 'Unknown',
            [TileType.RESTRICTED_AREA]: 'Restricted Area',
        }[type] || 'Unknown'
    );
}

export function aAnOrThe(type: TileType): string {
    return (
        {
            [TileType.CAPITAL]: 'the',
            [TileType.CITY]: 'a',
            [TileType.COMMERCIAL_DISTRICT]: 'the',
            [TileType.ECOLOGICAL_ZONE]: 'the',
            [TileType.GREENERY]: 'a',
            [TileType.INDUSTRIAL_CENTER]: 'the',
            [TileType.LAVA_FLOW]: 'the',
            [TileType.MINING_RIGHTS]: 'the',
            [TileType.MINING_AREA]: 'the',
            [TileType.MOHOLE_AREA]: 'the',
            [TileType.NATURAL_PRESERVE]: 'the',
            [TileType.NUCLEAR_ZONE]: 'the',
            [TileType.OCEAN]: 'an',
            [TileType.OTHER]: 'an',
            [TileType.RESTRICTED_AREA]: 'the',
        }[type] || 'an'
    );
}
