import {Card as CardComponent, CardContext} from 'components/card/Card';
import React from 'react';
import {PlayerState} from 'reducer';
import {getPlayedCards} from 'selectors/get-played-cards';
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
            {getPlayedCards(player).map(card => {
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
