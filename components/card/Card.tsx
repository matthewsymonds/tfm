import React from 'react';
import styled from 'styled-components';
import {Card as CardModel} from 'models/card';
import {CardRequirement} from 'components/card/CardRequirement';
import {CardCost} from 'components/card/CardCost';
import {CardTags} from 'components/card/CardTags';
import {CardType} from 'constants/card-types';
import {CardIconography} from 'components/card/CardIconography';
import {CardVictoryPoints} from 'components/card/CardVictoryPoints';
import {CardEffects} from 'components/card/CardEffects';
import {CardAction} from 'components/card/CardAction';
import spawnExhaustiveSwitchError from 'utils';
import {Flex} from 'components/box';

export const CARD_WIDTH = 200;
export const CARD_HEIGHT = 300;

const CardBase = styled.div<{isSelected: boolean | undefined}>`
    width: ${CARD_WIDTH}px;
    height: ${CARD_HEIGHT}px;
    border-radius: 3px;
    border: 1px solid black;
    box-shadow: ${props => (props.isSelected === true ? '0px 0px 6px 2px hsl(0 0% 54%);' : 'none')};
    opacity: ${props => (props.isSelected === false ? '0.5' : '1')};
    display: flex;
    flex-direction: column;
    position: relative;
    background-color: #f6d0b1;
`;
export type CardProps = {
    card: CardModel;
    button?: React.ReactNode;
    isSelected?: boolean;
};

const CardTopBar = styled.div`
    padding: 4px;
    display: flex;
    align-items: center;
`;

const CardText = styled.span`
    margin: 8px;
    font-size: 11px;
`;

function getCardTitleColorForType(type: CardType) {
    switch (type) {
        case CardType.ACTIVE:
            return 'blue';
        case CardType.EVENT:
            return 'red';
        case CardType.AUTOMATED:
            return 'green';
        case CardType.PRELUDE:
        case CardType.CORPORATION:
            return 'black';
        default:
            throw spawnExhaustiveSwitchError(type);
    }
}

const CardTitleBar = styled.div<{type: CardType}>`
    border-top: 1px solid black;
    border-bottom: 1px solid black;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    padding: 8px 0;
    background-color: ${props => getCardTitleColorForType(props.type)};
    color: white;
    text-align: center;
`;

export const Card: React.FC<CardProps> = ({card, button, isSelected}) => {
    return (
        <CardBase isSelected={isSelected}>
            <CardTopBar>
                <CardCost card={card} />
                <CardRequirement card={card} />
                <CardTags card={card} />
            </CardTopBar>
            <CardTitleBar type={card.type}>{card.name}</CardTitleBar>
            <CardText>{card.text}</CardText>
            <CardEffects card={card} />
            <CardAction card={card} />
            <CardIconography card={card} />
            <CardVictoryPoints card={card} />
            <Flex flex="auto"></Flex>
            {button}
        </CardBase>
    );
};
``;
