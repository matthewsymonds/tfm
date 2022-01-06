import styled from 'styled-components';

export const BlankButton = styled.button<{
    bgColor?: string;
    bgColorHover?: string;
    textColor?: string;
    scaleOnClick?: boolean;
}>`
    display: inline-block;
    border: none;
    margin: 0;
    text-decoration: none;
    background: ${props => props.bgColor ?? 'transparent'};
    color: unset;
    font-family: 'Open Sans', sans-serif;
    font-size: 1rem;
    text-align: center;
    transition: all 300ms;
    -webkit-appearance: none;
    -moz-appearance: none;

    &:disabled {
        opacity: 0.3;
        cursor: default;
    }

    &:hover {
        ${props => (props.bgColorHover ? `background: ${props.bgColorHover};` : '')}
    }

    &:focus {
        outline: 1px solid #fff;
        outline-offset: -4px;
    }

    &:active:not([disabled]) {
        ${props => (props.scaleOnClick === false ? '' : 'transform: scale(0.95);')}
    }
`;
