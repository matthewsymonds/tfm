import {Card as CardComponent, CardContext} from 'components/card/Card';
import React from 'react';
import {PlayerState} from 'reducer';
import styled from 'styled-components';

const PlayerHandBase = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    flex-wrap: wrap;
`;

export const PlayerPlayedCards = ({player}: {player: PlayerState}) => {
    return (
        <PlayerHandBase>
            {player.playedCards.map(card => {
                return (
                    <div style={{margin: 4}}>
                        <CardComponent
                            card={card}
                            key={card.name}
                            cardOwner={player}
                            cardContext={CardContext.PLAYED_CARD}
                            borderWidth={1}
                        />
                    </div>
                );
            })}
        </PlayerHandBase>
    );
};
