import styled from 'styled-components';

const color = (props: HexagonProps) => props.color;

interface HexagonProps {
    color: string;
    selectable?: boolean;
    overlap?: boolean;
}

const borderWidth = 2;

export const Hexagon = styled.div<HexagonProps>`
    color: black;
    position: ${props => (props.overlap ? 'absolute' : 'relative')};
    top: 0px;
    width: 64px;
    height: 64px;
    margin: -6px 2px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: ${props => (props.selectable ? 'pointer' : 'auto')};

    background: ${props => (props.selectable ? 'gray' : 'transparent')};
    &:hover {
        background: ${props => (props.selectable ? 'black' : 'transparent')};
    }

    &,
    &:before {
        clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    }

    & > * {
        // Make elements visible!
        z-index: 0;
    }

    &:before {
        content: '';
        position: absolute;
        top: ${borderWidth}px;
        left: ${borderWidth}px;
        height: calc(100% - ${borderWidth * 2}px);
        width: calc(100% - ${borderWidth * 2}px);
        background-color: ${color};
    }
`;
