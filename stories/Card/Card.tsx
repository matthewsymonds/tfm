import React from 'react';
import styled from 'styled-components';
import {Card as CardModel} from 'models/card';
import {CardRequirement} from 'stories/Card/CardRequirement';
import {CardCost} from 'stories/Card/CardCost';
import {CardTags} from 'stories/Card/CardTags';
import {CardType} from 'constants/card-types';
import {CardIconography} from 'stories/Card/CardIconography';
import {CardVictoryPoints} from 'stories/Card/CardVictoryPoints';
import {CardEffect} from 'stories/Card/CardEffect';
import {CardAction} from 'stories/Card/CardAction';
import spawnExhaustiveSwitchError from 'utils';

const CARD_WIDTH = 200;
const CARD_HEIGHT = 300;

const CardBase = styled.div`
    width: ${CARD_WIDTH}px;
    height: ${CARD_HEIGHT}px;
    border-radius: 3px;
    display: flex;
    flex-direction: column;
    position: relative;
    background-color: #f6d0b1;
`;
export type CardProps = {
    card: CardModel;
    selected?: boolean;
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
    background-color: ${(props) => getCardTitleColorForType(props.type)};
    color: white;
    text-align: center;
`;

export const Card: React.FC<CardProps> = ({card}) => {
    return (
        <CardBase>
            <CardTopBar>
                <CardCost card={card} />
                <CardRequirement card={card} />
                <CardTags card={card} />
            </CardTopBar>
            <CardTitleBar type={card.type}>{card.name}</CardTitleBar>
            <CardText>{card.text}</CardText>
            <CardEffect card={card} />
            <CardAction card={card} />
            <CardIconography card={card} />
            <CardVictoryPoints card={card} />
        </CardBase>
    );
};
``;
