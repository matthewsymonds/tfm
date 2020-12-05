import React from 'react';
import {Story, Meta} from '@storybook/react';
import {Card, CardProps} from 'stories/Card/Card';
import {cardConfigs} from 'constants/cards';
import {Card as CardModel} from 'models/card';

export default {
    title: 'Card',
    component: Card,
} as Meta;

const Template: Story<{}> = args => (
    <div style={{display: 'flex', flexWrap: 'wrap'}}>
        {cardConfigs
            // .filter(c => c.name === 'Adaptation Technology')
            .map(cardConfig => (
                <div style={{margin: 4}}>
                    <Card card={new CardModel(cardConfig)} />
                </div>
            ))}
    </div>
);

export const Default = Template.bind({});
Default.args = {};
