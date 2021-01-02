import {CardContext} from 'components/card/Card';
import {CardHand} from 'components/card/CardHand';
import React from 'react';
import {PlayerState} from 'reducer';
import {getCard} from 'selectors/get-card';

type PlayerHandProps = {
    player: PlayerState;
};

const PlayerHandInner = ({player}: PlayerHandProps) => {
    const cardInfos = player.cards.map(card => {
        return {
            card: getCard(card),
            cardOwner: player,
            cardContext: CardContext.SELECT_TO_PLAY,
        };
    });
    return <CardHand cardInfos={cardInfos} />;
};

export const PlayerHand = React.memo(PlayerHandInner, (prevProps, nextProps) => {
    return prevProps.player.cards.length === nextProps.player.cards.length;
});
