import {useState, useEffect} from 'react';
import {Resource} from '../constants/resource';
import {Card} from '../constants/card-types';
import {CardSelector} from '../components/card-selector';
import {MaybeVisible} from '../components/maybe-visible';
import styled from 'styled-components';
import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {GameStage} from '../constants/game';

import {setCorporation, setCards, goToGameStage} from '../actions';

const MarginalButton = styled.button`
  margin-top: 10px;
  margin-bottom: 10px;
`;

function selectCorporation([corporation]) {
  return setCorporation(corporation);
}

const ConfirmButton = props => (
  <MarginalButton {...props}>Confirm corporation and cards</MarginalButton>
);

interface CorporationSelectionProps {
  corporations: Card[];
  startingCards: Card[];
  handleConfirm(corporation: Card, cards: Card[]): void;
}

function getStartingAmount(corporation: Card): number {
  if (!corporation) return 0;

  return corporation.gainResource.filter(r => r === Resource.Megacredit).length;
}

export const CorporationSelection = () => {
  const dispatch = useDispatch();

  const corporation = useSelector(state => state.corporation);
  const corporations = useSelector(state => state.corporations);
  const startingCards = useSelector(state => state.startingCards);
  const cards = useSelector(state => state.cards);

  const corporationName = corporation && corporation.name;

  const startingAmount = getStartingAmount(corporation);

  const totalCardCost = cards.length * 3;

  const remaining = (startingAmount && startingAmount - totalCardCost) || 0;

  useEffect(() => {
    if (startingAmount && startingAmount < cards.length * 3) {
      dispatch(setCards([]));
    }
  }, [corporationName]);

  return (
    <>
      <h1>Select a corporation</h1>
      <CardSelector
        width={400}
        max={1}
        selectedCards={[corporation]}
        onSelect={([corporation]) => dispatch(setCorporation(corporation))}
        options={corporations}
        orientation="horizontal"
      />
      <MaybeVisible visible={!!corporationName}>
        <h2>You have selected {corporationName}</h2>
        <ConfirmButton
          onClick={() => dispatch(goToGameStage(GameStage.ActiveRound))}
        />
      </MaybeVisible>
      <h1>Select up to 10 cards</h1>
      <MaybeVisible left={true} visible={!!startingAmount}>
        <h2>
          You start with {startingAmount}€. You have {remaining}€ remaining.
        </h2>
        <h4>
          You have selected{' '}
          {cards.length ? cards.map(card => card.name).join(', ') : 'no cards.'}
        </h4>
      </MaybeVisible>
      <CardSelector
        max={10}
        width={250}
        selectedCards={corporationName ? cards : []}
        onSelect={cards => dispatch(setCards(cards))}
        options={startingCards}
        budget={remaining}
        orientation="vertical"
      />
      <MaybeVisible visible={!!corporationName}>
        <ConfirmButton
          onClick={() => dispatch(goToGameStage(GameStage.ActiveRound))}
        />
      </MaybeVisible>
    </>
  );
};
