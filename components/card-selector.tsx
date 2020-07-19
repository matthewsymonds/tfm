import {Card} from 'models/card';
import {CardComponent} from './card';
import styled from 'styled-components';

import React from 'react';

interface CardSelectorProps {
    min?: number;
    max: number;
    onSelect: (cards: Card[]) => void;
    options: Card[];
    orientation: string;
    selectedCards: Card[];
    budget?: number;
    className?: string;
}

const CardSelectorBase = styled.div<{orientation: string}>`
    display: flex;
    align-items: stretch;
    justify-content: center;
    flex-wrap: ${props => (props.orientation === 'vertical' ? 'wrap' : '')};
    margin: 0 auto;
    max-height: 340px;
    overflow-y: auto;
`;

export const CardSelector: React.FunctionComponent<CardSelectorProps> = props => {
    const {min = 0, max, onSelect, options, orientation, selectedCards, budget, className} = props;
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
        <CardSelectorBase className={className} orientation={orientation}>
            {options.map((option, key) => {
                const selected = selectedCards.indexOf(option) >= 0;

                const cannotSelect = !selected && !canSelect;
                const cannotUnselect = selected && selectedCards.length === min;

                const disabled = cannotSelect || cannotUnselect;
                return (
                    <CardComponent key={key} content={option} selected={selected}>
                        <button disabled={disabled} onClick={() => handleSelect(option)}>
                            {selected ? 'Unselect' : 'Select'}
                        </button>
                    </CardComponent>
                );
            })}
        </CardSelectorBase>
    );
};
