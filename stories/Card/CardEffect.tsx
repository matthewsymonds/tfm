import React from 'react';
import {Card as CardModel} from 'models/card';

export const CardEffect = ({card}: {card: CardModel}) => {
    if (card.effects.length < 1) {
        return null;
    }

    return null;
};
