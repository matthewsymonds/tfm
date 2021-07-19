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

// export function Arrow({
//     lineHeight,
//     lineWidth,
//     overallWidth,
//     pointHeight,
//     pointWidth,
//     color,
// }: {
//     lineHeight: number;
//     lineWidth: number;
//     overallWidth: number;
//     pointHeight: number;
//     pointWidth: number;
//     color: string;
// }) {
//     return (
//         <Box width={overallWidth + 'px'}>
//             <Box
//                 float="left"
//                 marginTop="14px"
//                 height={lineHeight + 'px'}
//                 width={lineWidth + 'px'}
//                 background={color}
//             ></Box>
//             <Box
//                 float="right"
//                 width={0}
//                 height={0}
//                 borderTop={pointHeight + 'px transparent'}
//                 borderBottom={pointHeight + 'px transparent'}
//                 borderLeft={pointWidth + 'px solid ' + color}
//             ></Box>
//         </Box>
//     );
// }
