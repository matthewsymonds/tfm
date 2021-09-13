import React from 'react';
import styled from 'styled-components';

const HexagonBase = styled.div<HexagonProps>`
    color: black;
    overflow: visible;
    position: relative;
    width: 100%;
    transform: ${props => (props.scale ? `scale(${props.scale})` : '')};
    cursor: ${props => (props.selectable ? 'pointer' : 'auto')};

    &:hover {
        &:before {
            background: ${props => (props.selectable ? 'dimgray' : props.color)};
        }
    }

    &:before {
        content: '';
        position: absolute;
        height: 100%;
        width: 100%;
        background-color: ${props => (props.selectable ? '#888' : props.color)};
        clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    }

    & > * {
        // Make elements visible!
        z-index: 0;
    }
`;

const HexagonDummy = styled.div`
    padding-top: 115.47%;
`;

const HexagonInner = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    flex-direction: column;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
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
    children,
}) => {
    return (
        <HexagonBase selectable={selectable} color={color} scale={scale}>
            <HexagonDummy />
            <HexagonInner>{children}</HexagonInner>
        </HexagonBase>
    );
};
