import {colors} from 'constants/game';
import styled from 'styled-components';

const SquareBase = styled.div<{color: string; shouldHideBorder?: boolean}>`
    width: 9px;
    height: 9px;
    display: inline-block;
    border: ${props => (props.shouldHideBorder ? '' : '2px solid rgba(200, 200, 200, 0.9)')};
    background: ${props => props.color};
`;

export const Square = ({
    playerIndex,
    shouldHideBorder,
}: {
    playerIndex: number;
    shouldHideBorder?: boolean;
}) => {
    const color = colors[playerIndex];

    return <SquareBase color={color} shouldHideBorder={shouldHideBorder} />;
};
