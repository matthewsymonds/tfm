import styled from 'styled-components';

export const ColoredTooltip = styled.div<{color: string; marginTop?: number}>`
    border-radius: 3px;
    background-color: #fae2cf;
    color: #111111;
    border: 1px solid ${props => props.color};
    margin-top: ${props => props.marginTop || 0}px;
    padding: 8px;
    font-size: 11px;
`;
