import {CardConfig} from './card-types';
import {Tag} from './tag';

export interface EffectTrigger extends Partial<CardConfig> {
    costGreaterThan?: number;
    anyPlayer?: boolean;
    onMars?: boolean;
    // Tags will be processed one-by-one (Research triggers science tags twice).
    // Card tags will be considered all at once (e.g. to check if card is a space event).
    cardTags?: Tag[];
    // Was the action a standard project? (Excluding selling patents).
    standardProject?: boolean;
    // For mining guild
    steelOrTitaniumPlacementBonus?: boolean;
}
