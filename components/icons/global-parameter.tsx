import React from 'react';
import {Parameter, TileType} from 'constants/board';
import styled from 'styled-components';
import {TileIcon} from 'components/icons/tile';
import {TagIcon} from 'components/icons/tag';
import spawnExhaustiveSwitchError from 'utils';
import {Tag} from 'constants/tag';

// TODO: Replace these with proper icons
export const AllCapsIcon = styled.div<{size: number; bgColor: string}>`
    height: ${(props) => props.size}px;
    background-color: ${(props) => props.bgColor};
    font-size: 0.75rem;
    text-transform: uppercase;
    font-kerning: 0.1rem;
    display: flex;
    align-items: center;
    padding: 2px;
`;

export const GlobalParameterIcon = ({
    parameter,
    size = 16,
}: {
    parameter: Parameter;
    size: number;
}) => {
    switch (parameter) {
        case Parameter.VENUS:
            return <TagIcon name={Tag.VENUS} size={size} />;
        case Parameter.OCEAN:
            return <TileIcon type={TileType.OCEAN} size={size} />;
        case Parameter.OXYGEN:
            return (
                <AllCapsIcon size={size} bgColor="#9dd3eb">
                    O₂
                </AllCapsIcon>
            );
        case Parameter.TEMPERATURE:
            return (
                <AllCapsIcon size={size} bgColor="#ebd19d">
                    TEMP
                </AllCapsIcon>
            );
        default:
            throw spawnExhaustiveSwitchError(parameter);
    }
};
