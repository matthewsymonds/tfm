import Color from 'color';
import {Flex} from 'components/box';
import {LiveCard as LiveCardComponent} from 'components/card/Card';
import {colors} from 'components/ui';
import {CardType} from 'constants/card-types';
import {Card as CardModel} from 'models/card';
import React, {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {usePopper} from 'react-popper';
import {useRect} from 'react-use-rect';
import styled from 'styled-components';
import spawnExhaustiveSwitchError from 'utils';

type SharedCardTokenProps = {
    card: CardModel;
    margin?: string;
};
type CardToggleTokenProps = SharedCardTokenProps & {
    onClick?: () => void;
    isSelected?: boolean;
    disabled?: boolean;
};
type CardTextTokenProps = SharedCardTokenProps & {
    showCardOnHover: boolean;
    variant?: 'pill' | 'text';
};

const CardTextTokenBase = styled.div<{
    cardStyle: {color: string};
    margin?: string;
    variant: 'pill' | 'text';
}>`
    background-color: ${props =>
        props.variant === 'pill' ? props.cardStyle.color : 'transparent'};
    color: ${props => (props.variant === 'pill' ? colors.TEXT_LIGHT_1 : props.cardStyle.color)};
    border-radius: ${props => (props.variant === 'pill' ? '4px' : '0')};
    padding: ${props => (props.variant === 'pill' ? '4px' : '0')};
    display: inline-flex;
    margin: ${props => props.margin ?? '0 4px'};
    cursor: default;
    font-size: 0.8em;
    transition: all 0.1s;
    opacity: 0.8;
    &:hover {
        opacity: 1;
    }
`;

const CardToggleTokenLabel = styled.label<{
    cardStyle: {color: string};
    margin?: string;
    isSelected?: boolean;
}>`
    color: ${colors.CARD_TEXT};
    display: inline-flex;
    white-space: nowrap;
    margin: ${props => props.margin ?? '0 4px'};
    padding: 4px;
    opacity: ${props => (props.isSelected ? 1 : 0.4)};
    border-radius: 4px;
    background-color: ${props => {
        let color = new Color(props.cardStyle.color);
        if (!props.isSelected) {
            return color.darken(0.2).desaturate(0.2).toString();
        }
        return color.toString();
    }};
    cursor: default;
    transition: all 0.1s;
`;

const CardToggleTokenHiddenInput = styled.input`
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
`;

function getStyleForCardType(cardType: CardType) {
    switch (cardType) {
        case CardType.ACTIVE:
            return {
                color: colors.CARD_ACTIVE,
            };
        case CardType.AUTOMATED:
            return {
                color: colors.CARD_AUTOMATED,
            };
        case CardType.CORPORATION:
            return {
                color: 'black',
            };
        case CardType.EVENT:
            return {
                color: colors.CARD_EVENT,
            };
        case CardType.PRELUDE:
            return {
                color: colors.CARD_PRELUDE,
            };
        default:
            throw spawnExhaustiveSwitchError(cardType);
    }
}

let uniqueId = 0;
const getUniqueId = () => uniqueId++;

export function useComponentId() {
    const idRef = useRef<null | number>(null);
    if (idRef.current === null) {
        idRef.current = getUniqueId();
    }
    return `${idRef.current}`;
}

export const CardToggleToken = ({
    card,
    onClick,
    isSelected,
    margin,
    disabled,
}: CardToggleTokenProps) => {
    const id = useComponentId();
    const cardStyle = getStyleForCardType(card.type);
    return (
        <React.Fragment>
            <CardToggleTokenHiddenInput
                id={id}
                type="checkbox"
                value={card.name}
                checked={isSelected}
                onChange={onClick}
                disabled={disabled}
            />
            <CardToggleTokenLabel
                htmlFor={id}
                cardStyle={cardStyle}
                isSelected={isSelected}
                margin={margin}
            >
                {card.name}
            </CardToggleTokenLabel>
        </React.Fragment>
    );
};

export const CardTextToken = ({
    card,
    margin,
    showCardOnHover,
    variant = 'text',
}: CardTextTokenProps) => {
    const [isHovering, setIsHovering] = useState(false);
    const cardStyle = getStyleForCardType(card.type);

    const _setIsHovering = useCallback((isHovering: boolean) => {
        setIsHovering(isHovering);
    }, []);

    const [ref, rect] = useRect();

    const showAbove = rect.top > 320;
    const topRelativeToWindow = rect.top + window.scrollY;

    return (
        <Flex display="inline-flex">
            <CardTextTokenBase
                ref={ref}
                cardStyle={cardStyle}
                margin={margin}
                variant={variant}
                {...(showCardOnHover
                    ? {
                          onMouseEnter: () => _setIsHovering(true),
                          onMouseLeave: () => {
                              _setIsHovering(false);
                          },
                      }
                    : {})}
            >
                {card.name === '' ? '[Event]' : card.name}
            </CardTextTokenBase>
            {isHovering && showCardOnHover && (
                <div
                    style={{
                        position: 'absolute',
                        zIndex: 10,
                        left: Math.min(rect.left, window.innerWidth - 210),
                        top: showAbove ? topRelativeToWindow - 310 : topRelativeToWindow + 30,
                    }}
                >
                    <LiveCardComponent card={card} />
                </div>
            )}
        </Flex>
    );
};
