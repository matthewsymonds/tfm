import {Meta, Story} from '@storybook/react';
import {Card, CardContext} from 'components/card/Card';
import {cardConfigs} from 'constants/cards';
import {Card as CardModel} from 'models/card';
import React from 'react';

export default {
    title: 'Card',
    component: Card,
} as Meta;

const Template: Story<{}> = args => (
    <div style={{display: 'flex', flexWrap: 'wrap'}}>
        {cardConfigs
            // .filter(c => c.name.length >= 25)
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
