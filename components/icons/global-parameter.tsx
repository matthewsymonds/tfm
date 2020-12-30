import {TagIcon} from 'components/icons/tag';
import {TileIcon} from 'components/icons/tile';
import {Parameter, TileType} from 'constants/board';
import {Tag} from 'constants/tag';
import React from 'react';
import styled from 'styled-components';
import spawnExhaustiveSwitchError from 'utils';

// TODO: Replace these with proper icons
export const AllCapsIcon = styled.div<{size: number; bgColor: string; margin?: number | string}>`
    height: ${props => props.size}px;
    background-color: ${props => props.bgColor};
    margin: ${props => (typeof props.margin === 'string' ? props.margin : `${props.margin}px`)};
    font-size: 0.75rem;
    text-transform: uppercase;
    font-kerning: 0.1rem;
    padding: 0 4px;
    display: flex;
    align-items: center;
`;

export const GlobalParameterIcon = ({
    parameter,
    size = 16,
    margin = 0,
}: {
    parameter: Parameter;
    size?: number;
    margin?: string | number;
}) => {
    switch (parameter) {
        case Parameter.VENUS:
            return <TagIcon name={Tag.VENUS} size={size} margin={margin} />;
        case Parameter.OCEAN:
            return <TileIcon type={TileType.OCEAN} size={size} margin={margin} />;
        case Parameter.OXYGEN:
            return (
                <AllCapsIcon size={size} bgColor="#9dd3eb" margin={margin}>
                    O₂
                </AllCapsIcon>
            );
        case Parameter.TEMPERATURE:
            return (
                <AllCapsIcon size={size} bgColor="#eb9db4" margin={margin}>
                    🌡
                </AllCapsIcon>
            );
        default:
            throw spawnExhaustiveSwitchError(parameter);
    }
};
