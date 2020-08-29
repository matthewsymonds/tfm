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
    const numSelected = selectedCards.length;
    const canSelect = (budget === undefined || budget >= 3) && numSelected < max;

    const handleSelect = (card: Card) => {
        const newSelectedCards = [...selectedCards];
        const index = selectedCards.indexOf(card);
        if (index < 0) {
            newSelectedCards.unshift(card);
        } else {
            newSelectedCards.splice(index, 1);
        }
        onSelect(newSelectedCards);
    };

    return (
        <CardSelectorBase className={className} orientation={orientation}>
            {options.map((option, key) => {
                const selected = selectedCards.indexOf(option) >= 0;

                const cannotSelect = !selected && !canSelect;
                const cannotUnselect = selected && numSelected === 1 && min === 1;

                const disabled = cannotSelect || cannotUnselect;
                const buttonText = cannotUnselect ? 'Selected' : selected ? 'Unselect' : 'Select';
                return (
                    <CardComponent key={key} content={option} selected={selected}>
                        <button disabled={disabled} onClick={() => handleSelect(option)}>
                            {buttonText}
                        </button>
                    </CardComponent>
                );
            })}
        </CardSelectorBase>
    );
};
