import {Parameter, TileType} from './board';
import {Tag} from './tag';

// TODO: the trigger type should probably be a union of all possible trigger types, e.g.
// EffectTrigger.TILE_PLACED_BY_ANYONE | EffectTrigger.TAG_PLAYED_BY_PLAYER | ...
// In its current state, the presence of any one of these optional properties pretty much defines
// its trigger type. By not having a "switch-able" property, we have to jump through hoops e.g.
// see the CardEffect component
export interface EffectTrigger {
    anyPlayer?: boolean;
    // To trigger the effect, action's cost must be greater than or equal to this number
    cost?: number;
    increasedParameter?: Parameter;
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

    // Vitor
    nonNegativeVictoryPointsIcon?: boolean;
}
