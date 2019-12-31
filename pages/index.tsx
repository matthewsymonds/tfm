import {INITIAL_BOARD_STATE, TileType} from '../constants/board';
import {Board} from '../components/board';
import {Row} from '../components/row';
import {Cell} from '../components/cell';
import {Tile} from '../components/tile';
import {GameStage} from '../constants/game';
import {useState, useEffect} from 'react';
import {cards} from '../constants/cards';
import {Resource} from '../constants/resource';
import {CardType, Card, Deck} from '../constants/card-types';
import {CardSelector} from '../components/card-selector';
import styled from 'styled-components';
import React from 'react';

const effects: Card[] = [];

function shuffle(array: Card[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

import {
  ResourceBoard,
  ResourceBoardRow,
  ResourceBoardCell
} from '../components/resource';

const getStringFromResource = (resource: Resource): string => {
  switch (resource) {
    case Resource.Megacredit:
      return 'mc';
    case Resource.Steel:
      return 'steel';
    case Resource.Titanium:
      return 'titanium';
    case Resource.Plant:
      return 'plant';
    case Resource.Energy:
      return 'energy';
    case Resource.Heat:
      return 'heat';
  }
};

type Token = [number, string];

function convertRawTokenToToken(rawToken: string[]): Token {
  const [amount, resource] = rawToken;
  return [Number(amount), resource];
}

const possibleCards = cards.filter(
  card => card.deck === Deck.Basic || card.deck === Deck.Corporate
);

const allCorporations = possibleCards.filter(
  card => card.type === CardType.Corporation
);

let deck = possibleCards.filter(card => card.type !== CardType.Corporation);

shuffle(deck);

const GameBase = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;
`;

const MarginalButton = styled.button`
  margin-top: 30px;
  margin-bottom: 30px;
`;

const ConfirmButton = props => (
  <MarginalButton {...props}>Confirm corporation and cards</MarginalButton>
);

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

interface ButtonProps {
  disabled?: boolean;
}

const LeftButton = styled.button<ButtonProps>`
  margin-left: 4px;
`;

export default function Index(props: IndexProps) {
  const [board] = useState(INITIAL_BOARD_STATE);
  const [corporation, setCorporation] = useState<Card>(null);
  const [cards, setCards] = useState([]);

  const [round, setRound] = useState(0);
  const [turn, setTurn] = useState(0);
  const [play, setPlay] = useState(0);

  const [gameStage, setGameStage] = useState<GameStage>(
    GameStage.CorporationSelection
  );

  const {corporations, startingCards} = props;

  const corporationName = corporation && corporation.name;

  const startingAmount = corporation && corporation.gainMegacredit;

  const totalCardCost = cards.length * 3;

  const remaining = (startingAmount && startingAmount - totalCardCost) || 0;

  useEffect(() => {
    if (startingAmount && startingAmount < cards.length * 3) {
      setCards([]);
    }
  }, [corporationName]);

  // Raw values
  const [playerMegacredit, setPlayerMegacredit] = useState(0);
  const [playerSteel, setPlayerSteel] = useState(0);
  const [playerTitanium, setPlayerTitanium] = useState(0);
  const [playerPlants, setPlayerPlants] = useState(0);
  const [playerEnergy, setPlayerEnergy] = useState(0);
  const [playerHeat, setPlayerHeat] = useState(0);

  // Production
  const [playerMegacreditProduction, setPlayerMegacreditProduction] = useState(
    0
  );
  const [playerSteelProduction, setPlayerSteelProduction] = useState(0);
  const [playerTitaniumProduction, setPlayerTitaniumProduction] = useState(0);
  const [playerPlantProduction, setPlayerPlantProduction] = useState(0);
  const [playerEnergyProduction, setPlayerEnergyProduction] = useState(0);
  const [playerHeatProduction, setPlayerHeatProduction] = useState(0);

  const [playedCard, setPlayedCard] = useState(null);

  function increaseProduction(resource: Resource, amount: number) {
    let str = getStringFromResource(resource);
    if (str === 'plant') {
      str = 'plants';
    }

    const token: Token = [amount, str];

    handleProductionIncreases([token]);
  }

  function gainResource(resource: Resource, amount: number) {
    const str = getStringFromResource(resource);
    const token: Token = [amount, str];
    handleDumps([token]);
  }

  function playCard(card: Card) {
    console.log('playing ', card);
  }

  function gainOneResource(resource: Resource[], target: Card) {
    gainResource(resource[0], 1);
  }

  function drawCard() {
    const newCard = deck.pop();
    setCards([...cards, newCard]);
  }

  function discardThenDraw() {
    setGameStage(GameStage.DiscardThenDraw);
  }

  const [temperature, setTemperature] = useState(-30);
  const [oceans, setOceans] = useState(0);
  const [oxygen, setOxygen] = useState(0);

  function cannotPlay(card: Card): string {
    switch (true) {
      case oceans < card.requiredOcean:
        return 'Not enough oceans';
      case temperature < card.temperature:
        return 'Temperature is too low';
      case oxygen < card.requiredOxygen:
        return 'Oxygen is too low';
      case oceans > card.requiredMaxOcean:
        return 'Not enough oceans';
      case temperature > card.requiredMaxTemperature:
        return 'Temperature is too low';
      case oxygen > card.requiredMaxOxygen:
        return 'Oxygen is too low';
    }
    return '';
  }

  function addOrRemoveOneResource(resource: Resource, callback: Function) {}

  useEffect(() => {
    if (!playedCard) return;
    const effect = {
      condition: {card: playedCard},
      increaseProduction,
      gainResource,
      discardThenDraw,
      gainOneResource,
      drawCard,
      addOrRemoveOneResource
    };
    for (const card of effects) {
      if (card.condition(effect.condition)) {
        card.effect(effect);
      }
    }
  }, [playedCard && playedCard.name]);

  const topRow = [
    {
      name: 'Megacredits',
      resource: Resource.Megacredit,
      amount: playerMegacredit,
      production: playerMegacreditProduction
    },
    {
      name: 'Steel',
      resource: Resource.Steel,
      amount: playerSteel,
      production: playerSteelProduction
    },

    {
      name: 'Titanium',
      resource: Resource.Titanium,
      amount: playerTitanium,
      production: playerTitaniumProduction
    }
  ];

  const bottomRow = [
    {
      name: 'Plants',
      resource: Resource.Plant,
      amount: playerPlants,
      production: playerPlantProduction
    },
    {
      name: 'Energy',
      resource: Resource.Energy,
      amount: playerEnergy,
      production: playerEnergyProduction
    },

    {
      name: 'Heat',
      resource: Resource.Heat,
      amount: playerHeat,
      production: playerHeatProduction
    }
  ];

  function addEffect(card: Card) {
    if (card.condition && card.effect) {
      effects.push(card);
    }
  }

  function handleConfirm() {
    const tokens = parseTokens(corporation, 'You start with ');
    const [productionIncreases, dumps] = tokens;

    // pay for cards
    const moneyDump = dumps.find(d => d[1] === 'MC');
    moneyDump[0] -= cards.length * 3;

    handleProductionIncreases(productionIncreases);
    handleDumps(dumps);
    addEffect(corporation);
    setPlayedCard(corporation);
    goToNextRound();
  }

  function handleDumps(tokens: Token[]) {
    for (const token of tokens) {
      const [amount, resource] = token;

      switch (resource) {
        case 'MC':
          setPlayerMegacredit(playerMegacredit + amount);
          break;
        case 'steel':
          setPlayerSteel(playerSteel + amount);
          break;
        case 'titanium':
          setPlayerTitanium(playerTitanium + amount);
          break;
        case 'plants':
          setPlayerPlants(playerPlants + amount);
          break;
        case 'energy':
          setPlayerEnergy(playerEnergy + amount);
          break;
        case 'heat':
          setPlayerHeat(playerHeat + amount);
          break;
      }
    }
  }

  function handleProductionIncreases(tokens: Token[]) {
    for (const token of tokens) {
      const [amount, resource] = token;

      switch (resource) {
        case 'MC':
          setPlayerMegacreditProduction(playerMegacredit + amount);
          break;
        case 'steel':
          setPlayerSteelProduction(playerSteel + amount);
          break;
        case 'titanium':
          setPlayerTitaniumProduction(playerTitanium + amount);
          break;
        // Singular "plant" for production
        case 'plant':
          setPlayerPlantProduction(playerPlants + amount);
          break;
        case 'energy':
          setPlayerEnergyProduction(playerEnergy + amount);
          break;
        case 'heat':
          setPlayerHeatProduction(playerHeat + amount);
          break;
      }
    }
  }

  function parseTokens(card: Card, prefix: string): [Token[], Token[]] {
    let text = card.oneTimeText;

    const sentences = text.split('.');

    const rawTokens = [];

    for (let sentence of sentences) {
      if (sentence.indexOf(prefix) !== 0) continue;
      sentence = sentence.slice(prefix.length);
      sentence = sentence.replace(' and ', ', ');
      sentence = sentence.replace(',,', ',');
      let parts = sentence.split(', ');
      rawTokens.push(...parts.map(part => part.split(' ')));
    }

    const productionIncreases = rawTokens.filter(t => t.length === 3);
    const dumps = rawTokens.filter(t => t.length === 2);

    return [
      productionIncreases.map(convertRawTokenToToken),
      dumps.map(convertRawTokenToToken)
    ];
  }

  function goToNextRound() {
    setGameStage(GameStage.ActiveRound);
    setRound(round + 1);
    setTurn(0);
    setPlay(0);
  }

  function selectCorporation([corporation]) {
    setCorporation(corporation);
  }

  return (
    <GameBase>
      {gameStage === GameStage.DiscardThenDraw && <div>Discard then draw</div>}
      {gameStage === GameStage.CorporationSelection && (
        <>
          <h1>Select a corporation</h1>
          <CardSelector
            max={1}
            selectedCards={[corporation]}
            onSelect={selectCorporation}
            options={corporations}
            orientation="horizontal"
          />
          <MaybeVisible visible={!!corporationName}>
            <h2>You have selected {corporationName}</h2>
            <ConfirmButton onClick={() => handleConfirm()} />
          </MaybeVisible>
          <h1>Select up to 10 cards</h1>
          <MaybeVisible left={true} visible={!!startingAmount}>
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
            onSelect={setCards}
            options={startingCards}
            budget={remaining}
            orientation="vertical"
          />
          <ConfirmButton onClick={() => handleConfirm()} />
        </>
      )}
      {gameStage === GameStage.ActiveRound && (
        <>
          <h1>{corporationName}</h1>
          <ResourceBoard>
            <ResourceBoardRow>
              {topRow.map(props => (
                <ResourceBoardCell {...props} />
              ))}
            </ResourceBoardRow>
            <ResourceBoardRow>
              {bottomRow.map(props => (
                <ResourceBoardCell {...props} />
              ))}
            </ResourceBoardRow>
          </ResourceBoard>
          <ul>
            {cards.map((card, index) => {
              const noPlay = cannotPlay(card);
              return (
                <React.Fragment key={index}>
                  <li>{card.name}</li>
                  <p>{card.oneTimeText}</p>
                  <p>{card.cost}</p>
                  <LeftButton
                    disabled={!!noPlay}
                    onClick={() => playCard(card)}>
                    Play
                  </LeftButton>
                  <p>{noPlay}</p>
                </React.Fragment>
              );
            })}
          </ul>
        </>
      )}
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
    </GameBase>
  );
}

Index.getInitialProps = () => {
  const corporations = sampleCards(allCorporations, 2);

  const startingCards = sampleCards(deck, 10);
  return {corporations, startingCards};
};
