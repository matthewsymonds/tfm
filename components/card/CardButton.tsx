import styled from 'styled-components';

export const CardButton = styled.button<{width?: number}>`
    width: ${props => props.width ?? 80}px;
`;
