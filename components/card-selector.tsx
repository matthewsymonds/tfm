import React from 'react';
import styled from 'styled-components';
import {Card as CardModel} from 'models/card';
import {Card as CardComponent} from 'components/card/Card';

interface CardSelectorProps {
    min?: number;
    max: number;
    onSelect: (cards: CardModel[]) => void;
    options: CardModel[];
    orientation: string;
    selectedCards: CardModel[];
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

const CardWrapper = styled.div`
    margin: 8px;
    cursor: pointer;
`;

export const CardSelector: React.FunctionComponent<CardSelectorProps> = props => {
    const {min = 0, max, onSelect, options, orientation, selectedCards, budget, className} = props;
    const numSelected = selectedCards.length;
    const canSelect = budget === undefined || budget >= 10;

    const handleSelect = (card: CardModel) => {
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
                    <CardWrapper onClick={() => handleSelect(option)} key={key}>
                        <CardComponent card={option} isSelected={selected} />
                    </CardWrapper>
                );
            })}
        </CardSelectorBase>
    );
};
