import {colors} from 'components/ui';
import styled from 'styled-components';

export const ActionContainerBase = styled.button`
    background-color: initial;
    padding: 4px;

    &:disabled {
        color: initial;
        background-color: initial;
    }

    border: 2px solid ${colors.DARK_2};
    border-radius: 4px;

    -webkit-transition: color 200ms ease-in-out, background-color 200ms ease-in-out,
        transform 50ms ease-in-out;
    transition: color 200ms ease-in-out, background-color 200ms ease-in-out,
        transform 50ms ease-in-out;
    &:hover:not(:disabled),
    &:focus:not(:disabled) {
        color: #fff;
        outline: 0;
        background-color: ${colors.DARK_2};
    }
    &:active:not(:disabled) {
        transform: scale(0.95);
    }

    &:hover:not(:disabled) {
        cursor: initial;
    }
`;
