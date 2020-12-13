import {ApiClient} from 'api-client';
import {ActionGuard} from 'client-server-shared/action-guard';
import {CardContext} from 'components/card/Card';
import {CardHand} from 'components/card/CardHand';
import PaymentPopover from 'components/popovers/payment-popover';
import {GameStage} from 'constants/game';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource';
import {AppContext, doesCardPaymentRequirePlayerInput} from 'context/app-context';
import {Card} from 'models/card';
import React, {useContext} from 'react';
import {useDispatch} from 'react-redux';
import {PlayerState, useTypedSelector} from 'reducer';
import styled from 'styled-components';

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
