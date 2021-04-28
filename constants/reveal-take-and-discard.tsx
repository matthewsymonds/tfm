import {getCard} from 'selectors/get-card';
import {SerializedCard} from 'state-serialization';
import {Resource} from './resource';
import {Tag} from './tag';

export enum CardSelectionCriteria {
    FLOATER_ICON = 'cardSelectionCriteriaFloaterIcon',
    VENUS_TAG = 'cardSelectionCriteriaVenusTag',
}

export const CARD_SELECTION_CRITERIA_SELECTORS = {
    [CardSelectionCriteria.FLOATER_ICON]: (serializedCard: SerializedCard): boolean => {
        const card = getCard(serializedCard);
        const f = Resource.FLOATER;
        if (card.storedResourceType === f) {
            return true;
        }
        if (card.requiredResources[f]) {
            return true;
        }
        const actions = [card, ...card.choice, card?.action, ...(card?.action?.choice ?? [])];
        for (const action of actions) {
            if (action?.gainResource?.[f] || action?.removeResource?.[f]) {
                return true;
            }
        }
        return false;
    },
    [CardSelectionCriteria.VENUS_TAG]: (serializedCard: SerializedCard): boolean => {
        const card = getCard(serializedCard);
        return card.tags.includes(Tag.VENUS);
    },
};
