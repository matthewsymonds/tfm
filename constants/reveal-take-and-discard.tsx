import {getCard} from 'selectors/get-card';
import {SerializedCard} from 'state-serialization';
import {CardSelectionCriteria} from './card-selection-criteria';
import {Resource} from './resource-enum';
import {Tag} from './tag';

export const CARD_SELECTION_CRITERIA_SELECTORS = {
    [CardSelectionCriteria.FLOATER_ICON]: (
        serializedCard: SerializedCard
    ): boolean => {
        const card = getCard(serializedCard);
        const f = Resource.FLOATER;
        if (card.storedResourceType === f) {
            return true;
        }
        if (card.requiredResources?.[f]) {
            return true;
        }
        const actions = [
            card,
            ...(card.choice ?? []),
            card?.action,
            ...(card?.action?.choice ?? []),
        ];
        for (const action of actions) {
            if (action?.gainResource?.[f] || action?.removeResource?.[f]) {
                return true;
            }
        }
        if (card.name.toLowerCase().split(' ').includes('floater')) {
            return true;
        }
        return false;
    },
    [CardSelectionCriteria.VENUS_TAG]: (
        serializedCard: SerializedCard
    ): boolean => {
        const card = getCard(serializedCard);
        return card.tags.includes(Tag.VENUS);
    },
    [CardSelectionCriteria.PLANT_TAG]: (
        serializedCard: SerializedCard
    ): boolean => {
        const card = getCard(serializedCard);
        return card.tags.includes(Tag.PLANT);
    },
    [CardSelectionCriteria.SPACE_TAG]: (
        serializedCard: SerializedCard
    ): boolean => {
        const card = getCard(serializedCard);
        return card.tags.includes(Tag.SPACE);
    },
};
