import {Card as CardComponent, CardContext} from 'components/card/Card';
import {Card as CardModel} from 'models/card';
import React from 'react';
import styled from 'styled-components';

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
    margin-bottom: 8px;
    width: 100%;
`;

const CardWrapper = styled.div`
    margin: 8px;
    cursor: pointer;
`;

export const CardSelector: React.FunctionComponent<CardSelectorProps> = props => {
    const {min = 0, max, onSelect, options, orientation, selectedCards, budget, className} = props;
    const numSelected = selectedCards.length;
    const mustSelectOne = max === 1;
    const canAfford = budget === undefined || budget >= (numSelected + 1) * 3;
    const canSelect = canAfford && (selectedCards.length < max || mustSelectOne);

    const handleSelect = (card: CardModel) => {
        let newSelectedCards = [...selectedCards];
        const index = selectedCards.findIndex(selectedCard => selectedCard.name === card.name);
        if (index < 0) {
            if (mustSelectOne) {
                // Special case. Just change the selection to the unselected card.
                newSelectedCards = [card];
            } else {
                newSelectedCards.unshift(card);
            }
        } else {
            newSelectedCards.splice(index, 1);
        }
        onSelect(newSelectedCards);
    };

    return (
        <CardSelectorBase className={className} orientation={orientation}>
            {options.map((option, key) => {
                const selected = selectedCards.some(card => card.name === option.name);

                const cannotSelect = !selected && !canSelect;
                const cannotUnselect = selected && numSelected === 1 && min === 1;

                const disabled = cannotSelect || cannotUnselect;
                return (
                    <CardWrapper
                        onClick={() => {
                            if (disabled) {
                                return;
                            }
                            handleSelect(option);
                        }}
                        key={key}
                    >
                        <CardComponent
                            cardContext={CardContext.SELECT_TO_KEEP}
                            card={option}
                            isSelected={selected}
                        />
                    </CardWrapper>
                );
            })}
        </CardSelectorBase>
    );
};
