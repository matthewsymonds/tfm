import React from 'react';
import {Story, Meta} from '@storybook/react';
import {Card, CardContext, CardProps} from 'components/card/Card';
import {cardConfigs} from 'constants/cards';
import {Card as CardModel} from 'models/card';

export default {
    title: 'Card',
    component: Card,
} as Meta;

const Template: Story<{}> = args => (
    <div style={{display: 'flex', flexWrap: 'wrap'}}>
        {cardConfigs
            // .filter(c => c.name === 'Olympus Conference')
            .map(cardConfig => {
                const card = new CardModel(cardConfig);
                card.storedResourceAmount = 3;
                return (
                    <div style={{margin: 4}}>
                        <Card card={card} cardContext={CardContext.NONE} />
                    </div>
                );
            })}
    </div>
);

export const Default = Template.bind({});
Default.args = {};
