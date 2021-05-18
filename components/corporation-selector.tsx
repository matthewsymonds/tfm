import React from 'react';
import {PlayerState} from 'reducer';
import styled from 'styled-components';
import {colors} from './ui';

const BaseText = styled.div`
    color: ${colors.LIGHT_2};
`;

export const CorporationSelector = ({player}: {player: PlayerState}) => {
    if (player.action) {
        return <BaseText>{player.username} is ready to play.</BaseText>;
    } else {
        return <BaseText>{player.username} is choosing a corporation and cards.</BaseText>;
    }
};
