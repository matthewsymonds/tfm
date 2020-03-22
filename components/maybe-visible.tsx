import styled from 'styled-components';

interface MaybeVisibleProps {
    visible: boolean;
    left?: boolean;
    margin?: number;
}

export const MaybeVisible = styled.div<MaybeVisibleProps>`
    visibility: ${props => (props.visible ? 'visible' : 'hidden')};
    align-self: stretch;
    text-align: ${props => (props.left ? 'left' : 'center')};
    margin-left: 24px;
    margin: ${props => props.margin || 0}px;
    margin-right: 24px;
`;
