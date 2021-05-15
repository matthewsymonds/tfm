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

type CardLinkProps = {
    card: CardModel;
    onClick?: () => void;
    isSelected?: boolean;
    margin?: string;
};

const CardLinkText = styled.div<{cardStyle: React.CSSProperties; margin?: string}>`
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

const CardLinkTokenToggle = styled.label<{
    cardStyle: React.CSSProperties;
    margin?: string;
    isSelected?: boolean;
}>`
    font-weight: 700;
    color: ${props => props.cardStyle.color};
    display: inline-flex;
    white-space: nowrap;
    margin: ${props => props.margin ?? '0 4px'};

    padding: 4px;
    opacity: ${props => (props.isSelected ? 1 : 0.5)};
    border-radius: 4px;
    background-color: ${props => props.cardStyle.backgroundColor};
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
                textColor: colors.CARD_PRELUDE,
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

export const CardLink = ({card, onClick, isSelected, margin}: CardLinkProps) => {
    const id = useComponentId();
    const cardStyle = getStyleForCardType(card.type);
    return (
        <Tooltip
            // options
            position="bottom-start"
            // @ts-expect-error space-separated triggers is kosher
            trigger="mouseenter click"
            useContext={true}
            offset={2}
            tag="span"
            html={
                <Flex marginTop="2px">
                    {/* HACK: the `distance` prop doesnt seem to work for tooltip */}
                    <CardComponent card={card} cardContext={CardContext.DISPLAY_ONLY} />
                </Flex>
            }
        >
            {onClick ? (
                <React.Fragment>
                    <HiddenInput id={id} type="checkbox" value={card.name} />
                    <CardLinkTokenToggle
                        htmlFor={id}
                        onClick={onClick}
                        cardStyle={cardStyle}
                        isSelected={isSelected}
                        margin={margin}
                    >
                        {card.name}
                    </CardLinkTokenToggle>
                </React.Fragment>
            ) : (
                <CardLinkText cardStyle={cardStyle} margin={margin}>
                    {card.name}
                </CardLinkText>
            )}
        </Tooltip>
    );
};
