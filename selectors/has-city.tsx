import {Cell, TileType} from 'constants/board';

const VALID_CITY_TYPES: Array<TileType | undefined> = [TileType.CITY, TileType.CAPITAL];

export function hasCity(cell: Cell): boolean {
    return VALID_CITY_TYPES.includes(cell?.tile?.type);
}
