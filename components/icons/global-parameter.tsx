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
    isInline?: boolean;
}>`
    height: ${props => props.size}px;
    line-height: ${props => props.size}px;
    background-color: ${props => props.bgColor};
    margin: ${props => (typeof props.margin === 'string' ? props.margin : `${props.margin}px`)};
    font-size: ${props => Math.ceil((2 / 3) * props.size)}px;
    border-radius: ${props => props.borderRadius ?? 0}px;
    text-transform: uppercase;
    padding: ${props => props.padding ?? 2}px;
    display: ${props => (props.isInline ? 'inline-flex' : 'flex')};
    align-items: center;
    justify-content: center;
    letter-spacing: 0.1em;
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
            return <TagIcon name={Tag.VENUS} size={size * 1.25} margin={margin} />;
        case Parameter.OCEAN:
            return <TileIcon type={TileType.OCEAN} size={(size * 4) / 3} margin={margin} />;
        case Parameter.OXYGEN:
            return (
                <AllCapsIcon
                    size={size - 4} // for padding
                    bgColor={colors.PARAMETERS[parameter]}
                    margin={margin}
                    isInline={true}
                >
                    O₂
                </AllCapsIcon>
            );
        case Parameter.TEMPERATURE:
            return (
                <AllCapsIcon
                    size={size - 4} // for padding
                    bgColor={colors.PARAMETERS[parameter]}
                    margin={margin}
                    isInline={true}
                >
                    🌡
                </AllCapsIcon>
            );
        default:
            throw spawnExhaustiveSwitchError(parameter);
    }
};
