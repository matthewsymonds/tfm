import React from 'react';
import {Story, Meta} from '@storybook/react';
import {Hand} from 'stories/Hand/Hand';

export default {
    title: 'Hand',
    component: Hand,
} as Meta;

const Template: Story<{}> = args => {
    return <Hand cards={[{}, {}, {}, {}, {}, {}, {}, {}, {}]} />;
};

export const Default = Template.bind({});
Default.args = {};
