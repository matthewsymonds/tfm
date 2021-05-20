import Color from 'color';
import {Flex} from 'components/box';
import {Card as CardComponent} from 'components/card/Card';
import {colors} from 'components/ui';
import {CardType} from 'constants/card-types';
import {Card as CardModel} from 'models/card';
import React, {useRef, useState} from 'react';
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
};

const CardTextTokenBase = styled.div<{cardStyle: React.CSSProperties; margin?: string}>`
    color: ${props => props.cardStyle.color};
    display: inline-flex;
    font-weight: 700;
    font-size: 1.1em;
    margin: ${props => props.margin ?? '0 4px'};
    cursor: default;
    transition: all 0.1s;
    &:hover {
        color: ${props => new Color(props.cardStyle.color).darken(0.2).saturate(0.5).toString()};
        opacity: 1;
    }
`;

const CardToggleTokenLabel = styled.label<{
    cardStyle: React.CSSProperties;
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

export const CardTextToken = ({card, margin, showCardOnHover}: CardTextTokenProps) => {
    const [isHovering, setIsHovering] = useState(false);
    const cardStyle = getStyleForCardType(card.type);

    return (
        <Flex position="relative" display="inline-flex">
            <CardTextTokenBase
                cardStyle={cardStyle}
                margin={margin}
                {...(showCardOnHover
                    ? {
                          onMouseEnter: () => setIsHovering(true),
                          onMouseLeave: () => setIsHovering(false),
                      }
                    : {})}
            >
                {card.name}
            </CardTextTokenBase>
            {isHovering && showCardOnHover && (
                <Flex position="absolute" style={{top: '30px', left: '8px'}}>
                    <CardComponent card={card} />
                </Flex>
            )}
        </Flex>
    );
};
