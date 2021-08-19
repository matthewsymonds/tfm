import {CardContext} from 'components/card/Card';
import {CardHand} from 'components/card/CardHand';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import React from 'react';
import {getCard} from 'selectors/get-card';

type PlayerHandProps = {
    playerCardsString: string;
    gameName: string;
};

const PlayerHandInner = ({playerCardsString}: PlayerHandProps) => {
    const player = useLoggedInPlayer();
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
    return prevProps.playerCardsString === nextProps.playerCardsString;
});
