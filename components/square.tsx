import styled from 'styled-components';

const colors = ['#ff2222', '#3987c9', '#008000', 'gray', 'gold'];

const CubeBase = styled.div<{color: string}>`
    width: 9px;
    height: 9px;
    position: absolute;
    z-index: 4;
    align-self: flex-start;
    transform: translate(0, 75%);
    border: 2px solid rgba(200, 200, 200, 0.9);
    background: ${props => props.color};
`;

export const Cube = ({playerIndex}: {playerIndex: number}) => {
    const color = colors[playerIndex];

    return <CubeBase color={color} />;
};
