import {INITIAL_BOARD_STATE} from '../constants/board';
import {Board} from '../components/board';
import {Row} from '../components/row';
import {Cell} from '../components/cell';
import {Tile} from '../components/tile';
import {useState, useEffect} from 'react';
import {cards} from '../constants/cards';
import {CardType, Card, Deck} from '../constants/card-types';
import {CardSelector} from '../components/card-selector';
import styled from 'styled-components';

const GameBase = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;
`;

interface MaybeVisibleProps {
  visible: boolean;
  left?: boolean;
  marginTop?: number;
}

const MaybeVisible = styled.div<MaybeVisibleProps>`
  visibility: ${props => (props.visible ? 'visible' : 'hidden')};
  align-self: stretch;
  text-align: ${props => (props.left ? 'left' : 'center')};
  margin-left: 24px;
  margin-top: ${props => props.marginTop || 0}px;
  margin-right: 24px;
`;

function sampleCards(deck: Card[], num: number) {
  const choices = [];
  let index: number;

  while (num > 0) {
    index = (deck.length * Math.random()) | 0;
    choices.push(deck.splice(index, 1)[0]);
    num--;
  }

  return choices;
}

interface IndexProps {
  corporations: Card[];
  startingCards: Card[];
}

export default function Index(props: IndexProps) {
  const [board] = useState(INITIAL_BOARD_STATE);
  const [selectedCorporations, selectCorporations] = useState([]);
  const [cards, selectCards] = useState([]);

  const {corporations, startingCards} = props;

  const corporationName =
    selectedCorporations.length > 0 ? selectedCorporations[0].name : '';

  const startingAmount =
    selectedCorporations[0] && selectedCorporations[0].gainMegacredit;

  const totalCardCost = cards.length * 3;

  const remaining = (startingAmount && startingAmount - totalCardCost) || 0;

  useEffect(() => {
    const startingAmount =
      selectedCorporations[0] && selectedCorporations[0].gainMegacredit;
    if (startingAmount && startingAmount < cards.length * 3) {
      selectCards([]);
    }
  }, [selectedCorporations.length]);

  return (
    <GameBase>
      <Board>
        {board.map((row, outerIndex) => (
          <Row key={outerIndex}>
            {row.map((cell, index) => (
              <Cell type={cell.type} bonus={cell.bonus} key={index}>
                {cell.tile && <Tile />}
              </Cell>
            ))}
          </Row>
        ))}
      </Board>
      <h1>Select a corporation</h1>
      <CardSelector
        max={1}
        selectedCards={selectedCorporations}
        onSelect={selectCorporations}
        options={corporations}
        orientation="horizontal"
      />
      <MaybeVisible visible={corporationName}>
        <h2>You have selected {corporationName}</h2>
      </MaybeVisible>
      <h1>Select up to 10 cards</h1>
      <MaybeVisible left={true} visible={startingAmount}>
        <h2>
          You start with {startingAmount}€. You have {remaining}€ remaining.
        </h2>
      </MaybeVisible>
      <MaybeVisible
        left={true}
        visible={corporationName && cards.length > 0}
        marginTop={15}>
        You have selected {cards.map(card => card.name).join(', ')}
      </MaybeVisible>
      <CardSelector
        max={10}
        selectedCards={corporationName ? cards : []}
        onSelect={selectCards}
        options={startingCards}
        budget={remaining}
        orientation="vertical"
      />
    </GameBase>
  );
}

Index.getInitialProps = () => {
  const possibleCards = cards.filter(
    card => card.deck === Deck.Basic || card.deck === Deck.Corporate
  );

  const corporations = sampleCards(
    possibleCards.filter(card => card.type === CardType.Corporation),
    2
  );

  const deck = possibleCards.filter(card => card.type !== CardType.Corporation);

  const startingCards = sampleCards(deck, 10);
  return {corporations, startingCards};
};
