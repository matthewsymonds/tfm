import {ResourceBoard, ResourceBoardRow, ResourceBoardCell} from '../components/resource';
import styled from 'styled-components';
import React, {useContext} from 'react';
import {CardComponent} from './card';
import {useSelector, useDispatch, useStore} from 'react-redux';
import stateHelpers from '../util/state-helpers';

import {GameState, useTypedSelector, RootState} from '../reducer';
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

export const ActiveRound = ({ playerId }: {playerId: number}) => {
    const corporation = useTypedSelector(state => state.players[playerId].corporation);
    const resources = useTypedSelector(state => state.players[playerId].resources);
    const productions = useTypedSelector(state => state.players[playerId].productions);
    const cards = useTypedSelector(state => state.players[playerId].cards);
    const store = useStore<RootState>();
    const dispatch = useDispatch();

    return (
        <>
            <h1>{corporation && corporation.name}</h1>
            <ResourceBoard>
                <ResourceBoardRow>
                    {[Resource.Megacredit, Resource.Steel, Resource.Titanium].map(resourceType => (
                        <ResourceBoardCell
                            resource={resourceType}
                            production={productions[resourceType]}
                            amount={resources[resourceType]}
                        />
                    ))}
                </ResourceBoardRow>
                <ResourceBoardRow>
                    {[Resource.Plant, Resource.Energy, Resource.Heat].map(resourceType => (
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
                    const canCardBePlayed = stateHelpers.canCardBePlayed(store.getState(), card);

                    return (
                        <CardComponent content={card} width={250}>
                            <Button disabled={!canCardBePlayed} onClick={() => dispatch(card.play(playerId))}>
                                Play
                            </Button>
                        </CardComponent>
                    );
                })}
            </Hand>
        </>
    );
};
