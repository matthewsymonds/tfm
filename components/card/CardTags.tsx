import {Flex} from 'components/box';
import {TagIcon} from 'components/icons/tag';
import {Card as CardModel} from 'models/card';
import React from 'react';

export const CardTags = ({card}: {card: CardModel}) => {
    return (
        <Flex
            position="absolute"
            top="0"
            right="0"
            flex="auto"
            justifyContent="flex-end"
            marginTop="4px"
            marginRight="4px"
        >
            {card.tags.map((tag, index) => (
                <div style={{marginLeft: 2}}>
                    <TagIcon key={index} name={tag} size={26} />
                </div>
            ))}
        </Flex>
    );
};
