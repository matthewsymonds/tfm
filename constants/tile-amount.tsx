import {Amount} from './action';
import {TileType} from './board';

export type TileAmount = {
    tile: TileType;
};

export function isTileAmount(amount: Amount): amount is TileAmount {
    if (typeof amount === 'number') return false;
    if (typeof amount === 'string') return false;
    return 'tile' in amount;
}
