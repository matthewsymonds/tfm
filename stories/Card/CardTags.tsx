import React from 'react';
import {Card as CardModel} from 'models/card';
import {TagIcon} from 'components/icons/tag';
import {Flex} from 'components/box';

export const CardTags = ({card}: {card: CardModel}) => {
    return (
        <Flex flex="auto" justifyContent="flex-end">
            {card.tags.map((tag, index) => (
                <TagIcon key={index} name={tag} size={16} />
            ))}
        </Flex>
    );
};
