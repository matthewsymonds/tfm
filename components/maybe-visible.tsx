import styled from 'styled-components';

interface MaybeVisibleProps {
    visible: boolean;
    textAlign?: string;
    margin?: number;
}

export const MaybeVisible = styled.div<MaybeVisibleProps>`
    visibility: ${props => (props.visible ? 'visible' : 'hidden')};
    align-self: stretch;
    text-align: ${props => props.textAlign ?? 'left'};
    margin-bottom: 8px;
`;
