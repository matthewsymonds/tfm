import styled from 'styled-components';

export const BlankButton = styled.button<{
    bgColor?: string;
    bgColorHover?: string;
    textColor?: string;
}>`
    display: inline-block;
    border: none;
    margin: 0;
    text-decoration: none;
    background: ${props => props.bgColor ?? 'transparent'};
    color: ${props => props.textColor ?? 'black'};
    font-family: 'Open Sans', sans-serif;
    font-size: 1rem;
    cursor: pointer;
    text-align: center;
    transition: background 150ms ease-in-out;
    -webkit-appearance: none;
    -moz-appearance: none;

    &:focus {
        outline: 1px solid #fff;
        outline-offset: -4px;
    }

    &:active {
        transform: scale(0.95);
    }
`;
