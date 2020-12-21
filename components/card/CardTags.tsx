import {Flex} from 'components/box';
import {TagIcon} from 'components/icons/tag';
import {Card as CardModel} from 'models/card';
import React from 'react';

export const CardTags = ({card}: {card: CardModel}) => {
    return (
        <Flex flex="auto" justifyContent="flex-end">
            {card.tags.map((tag, index) => (
                <TagIcon key={index} name={tag} size={16} />
            ))}
        </Flex>
    );
};
