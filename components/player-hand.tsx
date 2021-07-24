import {CardContext} from 'components/card/Card';
import {CardHand} from 'components/card/CardHand';
import React from 'react';
import {PlayerState} from 'reducer';
import {getCard} from 'selectors/get-card';

type PlayerHandProps = {
    player: PlayerState;
    gameName: string;
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
    if (prevProps.gameName !== nextProps.gameName) return false;
    const prevCards = prevProps.player.cards;
    const nextCards = nextProps.player.cards;

    const prevCardNames = prevCards.map(card => card?.name);
    const nextCardNames = nextCards.map(card => card?.name);

    return prevCardNames.join('-') === nextCardNames.join('-');
});
