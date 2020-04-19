import {ResourceBoard, ResourceBoardRow, ResourceBoardCell} from '../components/resource';
import styled from 'styled-components';
import React, {useContext} from 'react';
import {CardComponent} from './card';
import {useDispatch, useStore, shallowEqual} from 'react-redux';
import {AppContext} from '../context/app-context';
import {useTypedSelector, RootState} from '../reducer';
import {Resource} from '../constants/resource';
import {Card} from '../models/card';
import {Board} from './board';

interface ButtonProps {
    disabled?: boolean;
}

const Hand = styled.div`
    display: flex;
    align-items: stretch;
    justify-content: center;
    width: 100%;
    overflow-y: auto;
    flex-wrap: wrap;
`;

const Button = styled.button<ButtonProps>`
    margin: 0 auto;
`;

export const ActiveRound = ({playerIndex}: {playerIndex: number}) => {
    const corporation = useTypedSelector(state => state.players[playerIndex].corporation);
    const resources = useTypedSelector(state => state.players[playerIndex].resources);
    const productions = useTypedSelector(state => state.players[playerIndex].productions);
    const cards = useTypedSelector(state => state.players[playerIndex].cards);
    const playedCards = useTypedSelector(state => state.players[playerIndex].playedCards);
    const store = useStore<RootState>();
    const state = store.getState();
    const dispatch = useDispatch();
    const context = useContext(AppContext);

    return (
        <>
            <Board board={state.common.board} parameters={state.common.parameters} />
            <h1>{corporation && corporation.name}</h1>
            <ResourceBoard>
                <ResourceBoardRow>
                    {[Resource.MEGACREDIT, Resource.STEEL, Resource.TITANIUM].map(resourceType => (
                        <ResourceBoardCell
                            key={resourceType}
                            resource={resourceType}
                            production={productions[resourceType]}
                            amount={resources[resourceType]}
                        />
                    ))}
                </ResourceBoardRow>
                <ResourceBoardRow>
                    {[Resource.PLANT, Resource.ENERGY, Resource.HEAT].map(resourceType => (
                        <ResourceBoardCell
                            key={resourceType}
                            resource={resourceType}
                            production={productions[resourceType]}
                            amount={resources[resourceType]}
                        />
                    ))}
                </ResourceBoardRow>
            </ResourceBoard>
            <h3>Hand</h3>
            <Hand>
                {cards.map(card => {
                    const [canPlay, reason] = context.canPlayCard(card, state);
                    return (
                        <CardComponent content={card} width={250} key={card.name}>
                            {!canPlay && <em>{reason}</em>}
                            <Button
                                disabled={!context.canPlayCard(card, state)[0]}
                                onClick={() => {
                                    context.playCard(card, state);
                                    context.processQueue(dispatch);
                                }}>
                                Play
                            </Button>
                        </CardComponent>
                    );
                })}
            </Hand>
            <hr></hr>
            <h3>Played cards</h3>
            {playedCards.map(card => {
                const resourceMessage = getResourceMessage(card);

                return (
                    <CardComponent content={card} width={250} key={card.name}>
                        <div>{resourceMessage}</div>
                        {card.action && <button>Play action</button>}
                    </CardComponent>
                );
            })}
        </>
    );
};

function getResourceMessage(card: Card) {
    const {storedResourceType: type, storedResourceAmount: amount} = card;

    if (!type) return '';

    if (amount) {
        return `Holding ${amount} ${type}${amount > 1 ? 's' : ''}`;
    }

    `Holds ${type}s`;
}
