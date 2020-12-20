import React from 'react';
import {Story, Meta} from '@storybook/react';
import {CardHand} from 'components/card/CardHand';
import {cards} from 'models/card';

export default {
    title: 'Hand',
    component: CardHand,
} as Meta;

const Template: Story<{}> = args => {
    return (
        <div style={{height: 1000}}>
            {Array(100)
                .fill(null)
                .map((a, i) => (
                    <div style={{backgroundColor: i % 2 ? 'blue' : 'red', height: 20}}></div>
                ))}
            <CardHand cardInfos={cards.slice(0, 10).map(card => ({card}))} />
        </div>
    );
};

export const Default = Template.bind({});
Default.args = {};
