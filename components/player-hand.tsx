import {CardContext} from 'components/card/Card';
import {CardHand} from 'components/card/CardHand';
import React from 'react';
import {PlayerState} from 'reducer';

type PlayerHandProps = {
    player: PlayerState;
};

export const PlayerHand = ({player}: PlayerHandProps) => {
    // const dispatch = useDispatch();
    // const context = useContext(AppContext);
    // const state = useTypedSelector(state => state);
    // const gameStage = useTypedSelector(state => state?.common?.gameStage);

    // const loggedInPlayer = context.getLoggedInPlayer(state);
    // const isCorporationSelection = gameStage === GameStage.CORPORATION_SELECTION;
    // const isBuyOrDiscard = gameStage === GameStage.BUY_OR_DISCARD;

    const cardInfos = player.cards.map(card => {
        return {
            card,
            cardOwner: player,
            cardContext: CardContext.SELECT_TO_PLAY,
        };
    });
    return <CardHand cardInfos={cardInfos} />;
};
