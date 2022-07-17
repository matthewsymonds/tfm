import {Meta, Story} from '@storybook/react';
import {InfluenceIcon} from 'components/icons/other';
import {PartySymbol} from 'components/turmoil';
import {colors} from 'components/ui';
import React from 'react';

export default {
    title: 'Icon',
} as Meta;

const Template: Story<{}> = args => (
    <div
        style={{
            display: 'flex',
            flexDirection: 'column',
            height: 500,
            width: 500,
            background: colors.CARD_BG,
            padding: 16,
        }}
    >
        <div style={{marginBottom: 8}}>
            <h3>Influence icon</h3>
            <InfluenceIcon />
        </div>
        <div style={{marginBottom: 8}}>
            <h3>Party icon</h3>
            <PartySymbol party="Reds" />
            <PartySymbol party="Unity" />
            <PartySymbol party="Greens" />
            <PartySymbol party="Scientists" />
            <PartySymbol party="Kelvinists" />
            <PartySymbol party="Mars First" />
        </div>
    </div>
);
export const Default = Template.bind({});
Default.args = {};
