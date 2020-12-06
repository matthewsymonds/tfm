import React from 'react';
import styled from 'styled-components';
import {Card as CardModel} from 'models/card';

const CardCostBase = styled.div`
    border-radius: 50%;
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

export const CardCost = ({card}: {card: CardModel}) => {
    return <CardCostBase>{card.cost}</CardCostBase>;
};
