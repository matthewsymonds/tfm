import {colors} from 'components/ui';
import {CardType} from 'constants/card-types';
import Color from 'color';
import {Card as CardModel} from 'models/card';
import {Card as CardComponent, CardContext} from 'components/card/Card';
import styled from 'styled-components';
import spawnExhaustiveSwitchError from 'utils';
import {Tooltip} from 'react-tippy';
import React, {useRef} from 'react';
import {Flex} from 'components/box';

type CardTokenProps = {
    card: CardModel;
    onClick?: () => void;
    isSelected?: boolean;
    margin?: string;
    disabled?: boolean;
};

const CardTokenText = styled.div<{cardStyle: React.CSSProperties; margin?: string}>`
    font-weight: 700;
    color: ${props => props.cardStyle.color};
    display: inline-flex;
    margin: ${props => props.margin ?? '0 4px'};
    padding: 2px;
    border-radius: 4px;
    background-color: ${props => props.cardStyle.backgroundColor};
    cursor: default;
    transition: all 0.1s;
    &:hover {
        background-color: ${props =>
            new Color(props.cardStyle.backgroundColor).darken(0.2).toString()};
        color: ${props => new Color(props.cardStyle.color).darken(0.5).saturate(0.5).toString()};
        opacity: 1;
    }
`;

const CardTokenToggle = styled.label<{
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

const HiddenInput = styled.input`
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
                backgroundColor: '#e4eaf7',
                color: colors.CARD_ACTIVE,
            };
        case CardType.AUTOMATED:
            return {
                backgroundColor: '#ddf3db',
                color: colors.CARD_AUTOMATED,
            };
        case CardType.CORPORATION:
            return {
                backgroundColor: '#efefef',
                color: colors.CARD_CORPORATION,
            };
        case CardType.EVENT:
            return {
                backgroundColor: '#f1cece',
                color: colors.CARD_EVENT,
            };
        case CardType.PRELUDE:
            return {
                backgroundColor: '#fbeddd',
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

export const CardToken = ({card, onClick, isSelected, margin, disabled}: CardTokenProps) => {
    const id = useComponentId();
    const cardStyle = getStyleForCardType(card.type);
    return (
        <React.Fragment>
            {onClick ? (
                <React.Fragment>
                    <HiddenInput
                        id={id}
                        type="checkbox"
                        value={card.name}
                        checked={isSelected}
                        onChange={onClick}
                        disabled={disabled}
                    />
                    <CardTokenToggle
                        htmlFor={id}
                        cardStyle={cardStyle}
                        isSelected={isSelected}
                        margin={margin}
                    >
                        {card.name}
                    </CardTokenToggle>
                </React.Fragment>
            ) : (
                <CardTokenText cardStyle={cardStyle} margin={margin}>
                    {card.name}
                </CardTokenText>
            )}
        </React.Fragment>
    );
};
