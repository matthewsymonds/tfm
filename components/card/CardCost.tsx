import React from 'react';
import styled from 'styled-components';
import {Card as CardModel} from 'models/card';
import {CardContext} from 'components/card/Card';
import {PlayerState} from 'reducer';
import {getDiscountedCardCost} from 'context/app-context';

const CardCostBase = styled.div`
    border-radius: 50%;
    position: relative;
    border: 1px solid black;
    background-color: yellow;
    font-size: 1rem;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 4px;
    font-weight: 600;
`;

const OriginalCost = styled.div`
    position: absolute;
    top: 0;
    font-size: 8px;
`;

export const CardCost = ({
    card,
    loggedInPlayer,
    cardContext,
}: {
    card: CardModel;
    loggedInPlayer: PlayerState;
    cardContext: CardContext;
}) => {
    let discountedCost;
    if (cardContext === CardContext.SELECT_TO_PLAY || cardContext === CardContext.SELECT_TO_BUY) {
        discountedCost = getDiscountedCardCost(card, loggedInPlayer);
    }

    if (typeof discountedCost === 'number' && discountedCost !== card.cost) {
        return (
            <CardCostBase>
                <OriginalCost>
                    <s>{card.cost}</s>
                </OriginalCost>

                {discountedCost}
            </CardCostBase>
        );
    }
    return <CardCostBase>{card.cost}</CardCostBase>;
};
