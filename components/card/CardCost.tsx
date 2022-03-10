import {CardContext} from 'components/card/Card';
import {colors} from 'components/ui';
import {CardType} from 'constants/card-types';
import {Card as CardModel} from 'models/card';
import React from 'react';
import {PlayerState} from 'reducer';
import {getDiscountedCardCost} from 'selectors/get-discounted-card-cost';
import styled from 'styled-components';

const CardCostBase = styled.div`
    width: 30px;
    height: 30px;
    border-radius: 10px;
    position: absolute;
    top: 2px;
    left: 2px;
    font-family: 'Ubuntu Condensed', sans-serif;

    border: 1px solid ${colors.CARD_BORDER_2};
    background-color: ${colors.MEGACREDIT};
    font-size: 1rem;
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
    if (card.type === CardType.CORPORATION || card.type === CardType.PRELUDE) {
        return null;
    }
    let discountedCost;
    if (
        cardContext === CardContext.SELECT_TO_PLAY ||
        cardContext === CardContext.SELECT_TO_BUY
    ) {
        discountedCost = getDiscountedCardCost(card, loggedInPlayer);
    }

    return (
        <GenericCardCost
            originalCost={card.cost}
            cost={discountedCost ?? card.cost}
        />
    );
};

export const GenericCardCost = ({
    cost,
    originalCost,
}: {
    cost: string | number;
    originalCost?: string | number;
}) => {
    return (
        <CardCostBase>
            {originalCost && originalCost !== cost ? (
                <OriginalCost>
                    <s>{originalCost}</s>
                </OriginalCost>
            ) : null}
            {cost}
        </CardCostBase>
    );
};
