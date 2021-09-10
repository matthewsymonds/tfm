import {TagIcon} from 'components/icons/tag';
import {TileIcon} from 'components/icons/tile';
import {colors} from 'components/ui';
import {Parameter, TileType} from 'constants/board';
import {Tag} from 'constants/tag';
import React from 'react';
import styled from 'styled-components';
import spawnExhaustiveSwitchError from 'utils';

// TODO: Replace these with proper icons
export const AllCapsIcon = styled.div<{
    size: number;
    bgColor: string;
    margin?: number | string;
    borderRadius?: number;
    padding?: number;
}>`
    height: ${props => props.size}px;
    line-height: ${props => props.size}px;
    background-color: ${props => props.bgColor};
    margin: ${props => (typeof props.margin === 'string' ? props.margin : `${props.margin}px`)};
    font-size: ${props => Math.ceil((2 / 3) * props.size)}px;
    border-radius: ${props => props.borderRadius ?? 0}px;
    text-transform: uppercase;
    font-kerning: 0.1rem;
    padding: ${props => props.padding ?? 4}px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const GlobalParameterIcon = ({
    parameter,
    size = 16,
    margin = 2,
}: {
    parameter: Parameter;
    size?: number;
    margin?: string | number;
}) => {
    switch (parameter) {
        case Parameter.VENUS:
            return <TagIcon name={Tag.VENUS} size={size} margin={margin} />;
        case Parameter.OCEAN:
            return <TileIcon type={TileType.OCEAN} size={(size * 4) / 3} margin={margin} />;
        case Parameter.OXYGEN:
            return (
                <AllCapsIcon size={size} bgColor={colors.PARAMETERS[parameter]} margin={margin}>
                    O₂
                </AllCapsIcon>
            );
        case Parameter.TEMPERATURE:
            return (
                <AllCapsIcon size={size} bgColor={colors.PARAMETERS[parameter]} margin={margin}>
                    🌡
                </AllCapsIcon>
            );
        default:
            throw spawnExhaustiveSwitchError(parameter);
    }
};
