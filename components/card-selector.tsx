import {Card} from '../constants/card-types';
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
}

interface CardSelectorBaseProps {
  orientation: string;
}

const CardSelectorBase = styled.div<CardSelectorBaseProps>`
  display: flex;
  align-items: stretch;
  justify-content: ${props =>
    props.orientation === 'horizontal' ? 'center' : 'flex-start'};
  width: 100%;
  overflow-y: auto;
  flex-wrap: wrap;
`;

export const CardSelector: React.FunctionComponent<CardSelectorProps> = props => {
  const {max, onSelect, budget, options, orientation, selectedCards} = props;
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
    <>
      <CardSelectorBase orientation={orientation}>
        {options.map((option, key) => {
          const selected = selectedCards.indexOf(option) >= 0;
          return (
            <CardComponent
              key={key}
              content={option}
              canToggle={canSelect || selected}
              selected={selected}
              onSelect={handleSelect}
              orientation={orientation}
            />
          );
        })}
      </CardSelectorBase>
    </>
  );
};
