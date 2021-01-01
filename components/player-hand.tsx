import {CardContext} from 'components/card/Card';
import {CardHand} from 'components/card/CardHand';
import React from 'react';
import {PlayerState} from 'reducer';
import {getCard} from 'selectors/get-card';

type PlayerHandProps = {
    player: PlayerState;
};

export const PlayerHand = ({player}: PlayerHandProps) => {
    const cardInfos = player.cards.map(card => {
        return {
            card: getCard(card),
            cardOwner: player,
            cardContext: CardContext.SELECT_TO_PLAY,
        };
    });
    return <CardHand cardInfos={cardInfos} />;
};
