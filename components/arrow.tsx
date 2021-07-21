import styled from 'styled-components';
import {Flex} from './box';

type ArrowProps = {
    lineHeight: number;
    lineWidth: number;
    pointHeight: number;
    pointWidth: number;
    color: string;
};

export const ArrowLine = styled.div<ArrowProps>`
    width: ${props => props.lineWidth}px;
    height: ${props => props.lineHeight}px;
    background: ${props => props.color};
`;

const ArrowPoint = styled.div<ArrowProps>`
    width: 0;
    height: 0;
    border-top: ${props => props.pointHeight}px solid transparent;
    border-bottom: ${props => props.pointHeight}px solid transparent;
    border-left: ${props => props.pointWidth}px solid ${props => props.color};
`;

export const Arrow = (props: ArrowProps) => (
    <Flex
        alignItems="center"
        width={props.lineWidth + props.pointWidth + 'px'}
        height={Math.max(props.lineHeight, props.pointHeight * 2) + 'px'}
    >
        <ArrowLine {...props} />
        <ArrowPoint {...props} />
    </Flex>
);
