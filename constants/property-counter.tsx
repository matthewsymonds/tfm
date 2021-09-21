import {Amount} from './action';
import {Parameter} from './board';
import {CardSelectionCriteria} from './card-selection-criteria';
import {Resource} from './resource-enum';
import {Tag} from './tag';

/* Utility type that lets us represent a count, e.g.
   {[Enum.TypeA]: 56, [Enum.TypeC]: 23, [Enum.TypeD]: 4}
*/
export type PropertyCounter<K extends Resource | Parameter | Tag | CardSelectionCriteria> = {
    [k in K]?: Amount;
};

// Similar, but restricted to number amounts (no variable amounts).
export type NumericPropertyCounter<K extends Resource | Parameter | Tag | CardSelectionCriteria> = {
    [k in K]?: number;
};
