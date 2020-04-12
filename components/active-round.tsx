import {ResourceBoard, ResourceBoardRow, ResourceBoardCell} from '../components/resource';
import styled from 'styled-components';
import React, {useContext} from 'react';
import {CardComponent} from './card';
import {useDispatch, useStore} from 'react-redux';
import {AppContext} from '../context/app-context';
import {useTypedSelector, RootState} from '../reducer';
import {Resource} from '../constants/resource';

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

export const ActiveRound = ({playerId}: {playerId: number}) => {
    const corporation = useTypedSelector(state => state.players[playerId].corporation);
    const resources = useTypedSelector(state => state.players[playerId].resources);
    const productions = useTypedSelector(state => state.players[playerId].productions);
    const cards = useTypedSelector(state => state.players[playerId].cards);
    const store = useStore<RootState>();
    const state = store.getState();
    const dispatch = useDispatch();
    const context = useContext(AppContext);

    console.log('here is context', context);

    return (
        <>
            <h1>{corporation && corporation.name}</h1>
            <ResourceBoard>
                <ResourceBoardRow>
                    {[Resource.MEGACREDIT, Resource.STEEL, Resource.TITANIUM].map(resourceType => (
                        <ResourceBoardCell
                            resource={resourceType}
                            production={productions[resourceType]}
                            amount={resources[resourceType]}
                        />
                    ))}
                </ResourceBoardRow>
                <ResourceBoardRow>
                    {[Resource.PLANT, Resource.ENERGY, Resource.HEAT].map(resourceType => (
                        <ResourceBoardCell
                            resource={resourceType}
                            production={productions[resourceType]}
                            amount={resources[resourceType]}
                        />
                    ))}
                </ResourceBoardRow>
            </ResourceBoard>
            <h3>Hand</h3>
            <Hand>
                {cards.map((card, index) => {
                    return (
                        <CardComponent content={card} width={250}>
                            <Button
                                onClick={() => {
                                    const [canPlayCard, message] = context.canPlayCard(card, state);
                                    console.log('heres card', card);
                                    console.log('can play', canPlayCard);
                                    console.log('why', message);
                                }}>
                                Play
                            </Button>
                        </CardComponent>
                    );
                })}
            </Hand>
        </>
    );
};
