import styled from 'styled-components';
import {colors} from 'constants/game';

const SquareBase = styled.div<{color: string}>`
    width: 9px;
    height: 9px;
    display: inline-block;
    border: 2px solid rgba(200, 200, 200, 0.9);
    background: ${props => props.color};
`;

export const Square = ({playerIndex}: {playerIndex: number}) => {
    const color = colors[playerIndex];

    return <SquareBase color={color} />;
};
