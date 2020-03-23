import {ResourceBoard, ResourceBoardRow, ResourceBoardCell} from '../components/resource';
import styled from 'styled-components';
import React from 'react';
import {CardComponent} from './card';
import {useSelector, useDispatch} from 'react-redux';
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

export const ActiveRound = ({}) => {
    const corporation = useSelector(state => state.corporation);
    const resources = useSelector(state => state.resources);
    const productions = useSelector(state => state.productions);
    const cards = useSelector(state => state.cards);

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
                    // const noPlay = cannotPlay(card);

                    return (
                        <CardComponent content={card} width={250}>
                            {/* {noPlay && <p>({noPlay})</p>} */}
                            {/* <Button disabled={!!noPlay} onClick={() => playCard(card)}>
                                Play
                            </Button> */}
                        </CardComponent>
                    );
                })}
            </Hand>
        </>
    );
};
