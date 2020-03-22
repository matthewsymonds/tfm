import {
    ResourceBoard,
    ResourceBoardRow,
    ResourceBoardCell
} from '../components/resource';
import styled from 'styled-components';
import React from 'react';
import {CardComponent} from './card';

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

export const ActiveRound = ({
    corporation,
    topRow,
    bottomRow,
    playCard,
    cannotPlay,
    cards
}) => {
    return (
        <>
            <h1>{corporation && corporation.name}</h1>
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
            <h3>Hand</h3>
            <Hand>
                {cards.map((card, index) => {
                    const noPlay = cannotPlay(card);

                    return (
                        <CardComponent content={card} width={250}>
                            {noPlay && <p>({noPlay})</p>}
                            <Button
                                disabled={!!noPlay}
                                onClick={() => playCard(card)}>
                                Play
                            </Button>
                        </CardComponent>
                    );
                })}
            </Hand>
        </>
    );
};
