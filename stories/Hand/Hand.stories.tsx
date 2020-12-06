import React from 'react';
import {Story, Meta} from '@storybook/react';
import {CardHand} from 'components/card/CardHand';
import {cards} from 'models/card';

export default {
    title: 'Hand',
    component: CardHand,
} as Meta;

const Template: Story<{}> = args => {
    return <CardHand cardInfos={cards.slice(0, 10).map(card => ({card}))} />;
};

export const Default = Template.bind({});
Default.args = {};
