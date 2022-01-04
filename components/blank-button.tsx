import React from 'react';
import styled from 'styled-components';
import spawnExhaustiveSwitchError from 'utils';
import {colors} from './ui';

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
    cursor: pointer;
    text-align: center;
    transition: background 150ms ease-in-out;
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
