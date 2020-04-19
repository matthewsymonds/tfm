import {Resource} from './resource';
import {TilePlacement, Parameter} from './board';
import {Tag} from './tag';

/* Utility type that lets us represent a count, e.g.
   {[Enum.TypeA]: 56, [Enum.TypeC]: 23, [Enum.TypeD]: 4}
*/
export type PropertyCounter<K extends Resource | Parameter | Tag> = {
    [k in K]?: number;
};
