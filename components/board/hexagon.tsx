import {HEX_RADIUS} from 'constants/board';
import styled from 'styled-components';

const HexagonBase = styled.div<HexagonProps>`
    color: white;
    font-size: 30px;
    width: ${HEX_RADIUS * Math.cos((30 * Math.PI) / 180) * 2}px;
    height: ${HEX_RADIUS * 2}px;

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
interface HexagonProps {
    color: string;
    scale?: number;
    selectable?: boolean;
}

export const Hexagon: React.FunctionComponent<HexagonProps> = ({
    selectable,
    color,
    scale,
    children,
}) => {
    return (
        <HexagonBase selectable={selectable} color={color} scale={scale}>
            <div>{children}</div>
        </HexagonBase>
    );
};
