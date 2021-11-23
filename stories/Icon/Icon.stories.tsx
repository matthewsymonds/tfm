import {Meta, Story} from '@storybook/react';
import {InfluenceIcon} from 'components/icons/other';
import {colors} from 'components/ui';
import React from 'react';

export default {
    title: 'Icon',
} as Meta;

const Template: Story<{}> = args => (
    <div
        style={{display: 'flex', height: 500, width: 500, background: colors.CARD_BG, padding: 16}}
    >
        <h3>Influence icon</h3>
        <InfluenceIcon />
    </div>
);
export const Default = Template.bind({});
Default.args = {};
