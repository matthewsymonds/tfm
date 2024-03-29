import React, {MouseEventHandler} from 'react';
import styled from 'styled-components';
import spawnExhaustiveSwitchError from 'utils';
import {BlankButton} from './blank-button';
import {colors} from './ui';

type ButtonVariant = 'default' | 'bordered';
type ButtonSize = 'default' | 'small';

type ButtonProps = React.PropsWithChildren<{
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    type?: 'submit';
}>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (props, ref) => {
        const {
            children,
            onClick,
            disabled,
            type,
            variant = 'default',
            size = 'default',
        } = props;
        switch (variant) {
            case 'default':
                return (
                    <_DefaultButton
                        ref={ref}
                        size={size}
                        disabled={disabled}
                        onClick={onClick}
                        type={type}
                    >
                        {children}
                    </_DefaultButton>
                );
            case 'bordered':
                return (
                    <_BorderedButton
                        ref={ref}
                        size={size}
                        scaleOnClick={false}
                        disabled={disabled}
                        onClick={onClick}
                        type={type}
                    >
                        {children}
                    </_BorderedButton>
                );
            default:
                throw spawnExhaustiveSwitchError(variant);
        }
    }
);

function getStyleForSize(size: ButtonSize) {
    switch (size) {
        case 'default':
            return `
                padding: 3px 12px;
                font-size: 0.85em;
            `;
        case 'small':
            return `
                padding: 2px 8px;
                font-size: 0.7em;
            `;
        default:
            throw spawnExhaustiveSwitchError(size);
    }
}
const _BaseButton = styled(BlankButton)<{size: ButtonSize}>`
    ${props => getStyleForSize(props.size)}
    border-radius: 2px;
    transition: all 100ms, transform 50ms;
    display: inline-flex;
    justify-content: center;
    align-items: center;
`;

const _DefaultButton = styled(_BaseButton)`
    background: ${colors.LIGHT_4};
    color: ${colors.TEXT_DARK_1};

    &:hover:not([disabled]) {
        background: ${colors.LIGHT_2};
        box-shadow: 1px 1px 0px 1px ${colors.DARK_4};
    }
`;

const _BorderedButton = styled(_BaseButton)`
    background: ${colors.LIGHT_1};
    border: 1px solid ${colors.DARK_3};

    &:hover:not([disabled]) {
        box-shadow: 1px 1px 0px 1px ${colors.DARK_4};
        position: relative;
        top: -1px;
        left: -1px;

        &:active {
            box-shadow: none;
            position: relative;
            top: 0;
            left: 0;
        }
    }
`;
