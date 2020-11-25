import React from 'react';
import styled from 'styled-components';
import {HEX_RADIUS} from 'constants/board';

const HexagonBase = styled.div<HexagonProps & {hexRadius: number}>`
    color: white;
    font-size: 30px;
    width: ${props => props.hexRadius * Math.cos((30 * Math.PI) / 180) * 2}px;
    height: ${props => props.hexRadius * 2}px;

    transform: ${props => (props.scale ? `scale(${props.scale})` : '')};
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: ${props => (props.selectable ? 'pointer' : 'auto')};
    background: ${props => (props.selectable ? 'gray' : 'transparent')};
    &:hover {
        background: ${props => (props.selectable ? 'black' : 'transparent')};
    }

    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);

    &:before {
        content: '';
        position: absolute;
        height: 100%;
        width: 100%;
        background-color: ${props => props.color};
    }

    & > * {
        // Make elements visible!
        z-index: 0;
    }
`;
type HexagonProps = {
    color: string;
    scale?: number;
    selectable?: boolean;
    hexRadius?: number;
};

export const Hexagon: React.FunctionComponent<HexagonProps> = ({
    selectable,
    color,
    scale,
    hexRadius = HEX_RADIUS,
    children,
}) => {
    return (
        <HexagonBase selectable={selectable} color={color} scale={scale} hexRadius={hexRadius}>
            <div>{children}</div>
        </HexagonBase>
    );
};
