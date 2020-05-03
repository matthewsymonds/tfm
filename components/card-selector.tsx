import {Card} from '../models/card';
import {CardComponent} from './card';
import styled from 'styled-components';

import React from 'react';

interface CardSelectorProps {
    max: number;
    onSelect: (cards: Card[]) => void;
    options: Card[];
    orientation: string;
    selectedCards: Card[];
    budget?: number;
    width: number;
    className?: string;
}

const CardSelectorBase = styled.div`
    display: flex;
    align-items: stretch;
    justify-content: center;
    font-family: serif;
    flex-wrap: wrap;
    margin: 0 auto;
    &.inline {
        margin-left: 32px;
        margin-right: 32px;
        display: inline-flex;
        max-width: fit-content;
    }
    max-width: 1300px;
`;

export const CardSelector: React.FunctionComponent<CardSelectorProps> = props => {
    const {max, onSelect, budget, options, width, selectedCards} = props;
    const canSelect = budget === undefined || budget >= 3;

    const handleSelect = (card: Card) => {
        let newSelectedCards = [...selectedCards];
        const index = selectedCards.indexOf(card);
        if (index < 0) {
            newSelectedCards.unshift(card);
        } else {
            newSelectedCards.splice(index, 1);
        }

        newSelectedCards = newSelectedCards.slice(0, max);

        onSelect(newSelectedCards);
    };

    return (
        <CardSelectorBase className={props.className}>
            {options.map((option, key) => {
                const selected = selectedCards.indexOf(option) >= 0;
                return (
                    <CardComponent width={width} key={key} content={option} selected={selected}>
                        <button
                            disabled={!selected && !canSelect}
                            onClick={() => handleSelect(option)}
                        >
                            {selected ? 'Unselect' : 'Select'}
                        </button>
                    </CardComponent>
                );
            })}
        </CardSelectorBase>
    );
};
