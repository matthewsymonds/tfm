import {Meta, Story} from '@storybook/react';
import PlayerPanel from 'components/player-panel-new';
import React from 'react';
import {useTypedSelector} from 'reducer';

export default {
    title: 'PlayerPanel',
    component: PlayerPanel,
} as Meta;

const Template: Story<{}> = args => {
    const player = useTypedSelector(state => state.players[0]);
    return (
        <div style={{height: 1000}}>
            <PlayerPanel player={player} />
        </div>
    );
};

export const Default = Template.bind({});
Default.args = {};
