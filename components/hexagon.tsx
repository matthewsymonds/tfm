import styled from 'styled-components';

const color = (props: HexagonProps) => props.color;

interface HexagonProps {
    color: string;
}

export const Hexagon = styled.div<HexagonProps>`
    position: relative;
    width: 78px;
    height: 45px;
    background-color: ${color};
    margin: 14px 4px;
    display: flex;
    justify-content: center;
    align-items: center;

    &:before,
    &:after {
        content: '';
        position: absolute;
        width: 0;
        border-left: 39px solid transparent;
        border-right: 39px solid transparent;
    }

    &:before {
        bottom: 100%;
        border-bottom: 22.5px solid ${color};
    }

    &:after {
        top: 100%;
        width: 0;
        border-top: 22.5px solid ${color};
        left: 0;
    }
`;
