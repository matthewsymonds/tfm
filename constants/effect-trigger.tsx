import {Tag} from './tag';
import {TileType, Parameter} from './board';

export interface EffectTrigger {
    anyPlayer?: boolean;
    // To trigger the effect, action's cost must be greater than or equal to this number
    cost?: number;
    increaseParameter?: Parameter;
    onMars?: boolean;
    // Tags will be processed one-by-one (Research triggers science tags twice).
    tags?: Tag[];
    // Card tags will be considered all at once (e.g. to check if card is a space event).
    cardTags?: Tag[];
    // Was the action a standard project? (Excluding selling patents).
    standardProject?: boolean;
    // For mining guild
    steelOrTitaniumPlacementBonus?: boolean;

    placedTile?: TileType;
}
