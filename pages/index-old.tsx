import {INITIAL_BOARD_STATE, Tile} from '../constants/board';
import {Board} from '../components/board';
import {Row} from '../components/row';
import {Cell} from '../components/cell';
import {ResourceBoardCellProps} from '../components/resource';
import {Tile as TileComponent} from '../components/tile';
import {useState, useEffect} from 'react';
import {getCardsFromNames, cards} from '../constants/cards';
import {Resource} from '../constants/resource';
import {CardType, Card, Deck} from '../constants/card-types';
import styled from 'styled-components';
import React from 'react';
import {CorporationSelection} from '../components/corporation-selection';
import {useSelector} from 'react-redux';
import {ActiveRound} from '../components/active-round';

const useForceUpdate = () => {
    const [, setIt] = useState(false);
    return () => setIt(it => !it);
};

const effects: Card[] = [];

let topRow: ResourceBoardCellProps[] = [];
let bottomRow: ResourceBoardCellProps[] = [];

const resources = {} as {[key in Resource]: ResourceBoardCellProps};

type Token = [Resource, number];

function handleProductionChanges(list: Resource[] = [], multiplier: number) {
    const productionChanges = tokenize(list);

    for (const token of productionChanges) {
        if (!resources[token[0]]) continue;
        const {setProduction, production} = resources[token[0]];
        const increase = token[1];
        setProduction(production + increase * multiplier);
    }
}

function handleResourceChanges(
    list: Resource[] = [],
    multiplier: number,
    setCards: Function
) {
    const resourceChanges = tokenize(list);

    for (const token of resourceChanges) {
        if (token[0] === Resource.Card) {
            const newCards = sampleCards(deck, token[1]);
            setCards([...cards, ...newCards]);
            continue;
        }

        if (!resources[token[0]]) continue;
        const {setAmount, amount} = resources[token[0]];
        const increase = token[1];
        setAmount(amount + increase * multiplier);
    }
}

function cannotRemoveResources(list: Resource[] = []) {
    const resourceChanges = tokenize(list);

    for (const token of resourceChanges) {
        if (!resources[token[0]]) continue;
        const {amount} = resources[token[0]];
        const decrease = token[1];
        if (decrease > amount) return true;
    }

    return false;
}

function cannotDecreaseProduction(list: Resource[] = []) {
    const productionChanges = tokenize(list);

    for (const token of productionChanges) {
        if (!resources[token[0]]) continue;
        const {production} = resources[token[0]];
        const decrease = token[1];
        if (token[0] === Resource.Megacredit) {
            if (decrease - production < -5) return true;
        } else {
            if (decrease > production) return true;
        }
    }

    return false;
}

function tokenize(list: Resource[]): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    while (i < list.length) {
        const item = list[i];
        if (
            tokens[tokens.length - 1] &&
            tokens[tokens.length - 1][0] === item
        ) {
            tokens[tokens.length - 1][1]++;
        } else {
            tokens.push([item, 1]);
        }
        i++;
    }
    return tokens;
}

const GameBase = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-direction: column;
`;

interface IndexProps {
    corporations: string[];
    startingCards: string[];
}

export default function Index(props: IndexProps) {
    const forceUpdate = useForceUpdate();
    const gameStage = useSelector(state => state.gameStage);

    const [board] = useState(INITIAL_BOARD_STATE);

    const [corporation, setCorporation] = useState<Card>(null);
    const [cards, setCards] = useState([]);

    const [generation, setGeneration] = useState(0);
    const [round, setRound] = useState(0);
    const [turn, setTurn] = useState(0);

    const {corporations: corpNames, startingCards: startingCardNames} = props;
    const corporations = getCardsFromNames(corpNames);
    const startingCards = getCardsFromNames(startingCardNames);

    // Raw values
    const [megacredits, setMegacredits] = useState(0);
    const [steel, setSteel] = useState(0);
    const [titanium, setTitanium] = useState(0);
    const [plants, setPlants] = useState(0);
    const [energy, setEnergy] = useState(0);
    const [heat, setHeat] = useState(0);

    // Production
    const [megacreditProduction, setMegacreditProduction] = useState(0);
    const [steelProduction, setSteelProduction] = useState(0);
    const [titaniumProduction, setTitaniumProduction] = useState(0);
    const [plantProduction, setPlantProduction] = useState(0);
    const [energyProduction, setEnergyProduction] = useState(0);
    const [heatProduction, setHeatProduction] = useState(0);

    const [playedCard, setPlayedCard] = useState<Card>(null);
    const [playedCards, setPlayedCards] = useState<Card[]>([]);

    const [tiles, setTiles] = useState<Tile[]>([]);

    const [temperature, setTemperature] = useState(-30);
    const [oceans, setOceans] = useState(0);
    const [oxygen, setOxygen] = useState(0);

    function cannotPlay(card: Card): string {
        switch (true) {
            case megacredits < card.cost:
                return `Cannot afford ${card.cost}€, only have ${megacredits}€`;
            case oceans < card.requiredOcean:
                return 'Not enough oceans';
            case temperature < card.requiredTemperature:
                return 'Temperature is too low';
            case oxygen < card.requiredOxygen:
                return 'Oxygen is too low';
            case oceans > card.requiredMaxOcean:
                return 'Not enough oceans';
            case temperature > card.requiredMaxTemperature:
                return 'Temperature is too low';
            case oxygen > card.requiredMaxOxygen:
                return 'Oxygen is too low';
            case !card.requirement?.({
                plants,
                energyProduction,
                megacreditProduction,
                steelProduction,
                titaniumProduction,
                tiles
            }):
                return card.requirementFailedMessage;
        }

        if (cannotDecreaseProduction(card.decreaseProduction)) {
            return 'Must be able to decrease production';
        }

        if (cannotRemoveResources(card.removeResource)) {
            return 'Not enough resources to remove';
        }

        return '';
    }

    function addOrRemoveOneResource() {}
    function discardThenDraw() {}
    function drawCard() {}
    function increaseProduction() {}
    function gainResourceOption() {}
    function gainResource() {}

    useEffect(() => {
        if (!playedCard) return;
        const effect = {
            addOrRemoveOneResource,
            gainResourceOption,
            condition: {card: playedCard},
            discardThenDraw,
            drawCard,
            gainResource,
            increaseProduction
        };
        for (const card of effects) {
            if (card.condition(effect.condition)) {
                card.effect(effect);
            }
        }
    }, [playedCard && playedCard.name]);

    useEffect(() => {
        topRow = [
            {
                name: 'Megacredits',
                resource: Resource.Megacredit,
                amount: megacredits,
                setAmount: setMegacredits,
                production: megacreditProduction,
                setProduction: setMegacreditProduction
            },
            {
                name: 'Steel',
                resource: Resource.Steel,
                amount: steel,
                setAmount: setSteel,
                production: steelProduction,
                setProduction: setSteelProduction
            },

            {
                name: 'Titanium',
                resource: Resource.Titanium,
                amount: titanium,
                setAmount: setTitanium,
                production: titaniumProduction,
                setProduction: setTitaniumProduction
            }
        ];

        bottomRow = [
            {
                name: 'Plants',
                resource: Resource.Plant,
                amount: plants,
                setAmount: setPlants,
                production: plantProduction,
                setProduction: setPlantProduction
            },
            {
                name: 'Energy',
                resource: Resource.Energy,
                amount: energy,
                setAmount: setEnergy,
                production: energyProduction,
                setProduction: setEnergyProduction
            },

            {
                name: 'Heat',
                resource: Resource.Heat,
                amount: heat,
                setAmount: setHeat,
                production: heatProduction,
                setProduction: setHeatProduction
            }
        ];
        for (const cell of [...topRow, ...bottomRow]) {
            resources[cell.resource] = cell;
        }
        forceUpdate();
    }, [
        megacredits,
        megacreditProduction,
        steel,
        steelProduction,
        titanium,
        titaniumProduction,
        plants,
        plantProduction,
        energy,
        energyProduction,
        heat,
        heatProduction
    ]);

    function addEffect(card: Card) {
        if (card.condition && card.effect) {
            effects.push(card);
        }
    }

    function playCard(card: Card) {
        addEffect(card);
        handleProductionChanges(card.decreaseProduction, -1);
        handleProductionChanges(card.increaseProduction, 1);
        handleResourceChanges(card.removeResource, -1, setCards);
        handleResourceChanges(card.gainResource, 1, setCards);

        setPlayedCard(card);
        setPlayedCards([...playedCards, card]);
        setCards(cards => cards.filter(c => c !== card));
        forceUpdate();
    }

    function handleConfirm(corporation: Card, cards: Card[]) {
        setCorporation(corporation);
        const megacredits = corporation.gainResource.filter(
            r => r === Resource.Megacredit
        );
        const otherResources = corporation.gainResource.filter(
            r => r !== Resource.Megacredit
        );

        megacredits.length -= cards.length * 3;

        corporation.gainResource = [...megacredits, ...otherResources];

        playCard(corporation);
        setCards(cards);
        goToNextRound();
    }

    function goToNextRound() {
        setGameStage(GameStage.ActiveRound);
        setGeneration(generation + 1);
        setRound(0);
        setTurn(0);
    }

    return (
        <GameBase>
            {gameStage === GameStage.DiscardThenDraw && (
                <div>Discard then draw</div>
            )}
            {gameStage === GameStage.CorporationSelection && (
                <CorporationSelection
                    startingCards={startingCards}
                    corporations={corporations}
                    handleConfirm={handleConfirm}
                />
            )}
            <div>{foo}</div>
            {gameStage === GameStage.ActiveRound && (
                <ActiveRound
                    corporation={corporation}
                    cards={cards}
                    playCard={playCard}
                    cannotPlay={cannotPlay}
                    topRow={topRow}
                    bottomRow={bottomRow}
                />
            )}
            <Board>
                {board.map((row, outerIndex) => (
                    <Row key={outerIndex}>
                        {row.map(
                            (cell, index) =>
                                cell.onMars && (
                                    <Cell
                                        type={cell.type}
                                        bonus={cell.bonus}
                                        key={index}>
                                        {cell.tile && <TileComponent />}
                                    </Cell>
                                )
                        )}
                    </Row>
                ))}
            </Board>
        </GameBase>
    );
}
