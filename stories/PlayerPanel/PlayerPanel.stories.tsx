import {Meta, Story} from '@storybook/react';
import PlayerPanel from 'components/player-panel';
import React from 'react';
import {useTypedSelector} from 'reducer';

export default {
    title: 'PlayerPanel',
    component: PlayerPanel,
} as Meta;

const Template: Story<{}> = args => {
    const players = useTypedSelector(state => state.players);
    return (
        <div style={{height: 1000}}>
            {players.map((player, i) => (
                <div style={{margin: 8}} key={i}>
                    <PlayerPanel player={player} />
                </div>
            ))}
        </div>
    );
};

export const Default = Template.bind({});
Default.args = {};
