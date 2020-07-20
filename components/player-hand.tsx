import {useDispatch, useStore} from 'react-redux';
import {useContext} from 'react';
import {AppContext, doesCardPaymentRequirePlayerInput} from 'context/app-context';
import {Card} from 'models/card';
import {PropertyCounter} from 'constants/property-counter';
import {Resource, getResourceName} from 'constants/resource';
import {moveCardFromHandToPlayArea} from 'actions';
import PaymentPopover from 'components/popovers/payment-popover';
import {CardComponent, CardDisabledText, CardText, CardActionElements} from 'components/card';
import {RootState, PlayerState, useTypedSelector} from 'reducer';
import styled from 'styled-components';
import {GameStage} from 'constants/game';
import {CardType} from 'constants/card-types';

const PlayerHandBase = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    flex-wrap: wrap;
`;

type PlayerHandProps = {
    player: PlayerState;
};

export const PlayerHand = ({player}: PlayerHandProps) => {
    const dispatch = useDispatch();
    const context = useContext(AppContext);
    const store = useStore<RootState>();
    const state = store.getState();

    const gameStage = useTypedSelector(state => state?.common?.gameStage);

    const loggedInPlayer = context.getLoggedInPlayer(state);
    const isCorporationSelection = gameStage === GameStage.CORPORATION_SELECTION;
    const isBuyOrDiscard = gameStage === GameStage.BUY_OR_DISCARD;

    function playCard(card: Card, payment?: PropertyCounter<Resource>) {
        dispatch(moveCardFromHandToPlayArea(card, loggedInPlayer.index));
        context.playCard(card, state, payment);
        // Have to trigger effects from the card we just played.
        // Must be processed separatedly in case the card affects itself.
        context.triggerEffectsFromPlayedCard(
            card,
            // refreshed state so that the card we just played is present.
            store.getState()
        );
        context.processQueue(dispatch);
    }

    function renderPlayCardButton(card: Card, canPlay: boolean) {
        if (loggedInPlayer.index !== player.index) {
            return null;
        }

        if (!canPlay || loggedInPlayer.pendingDiscard) {
            return <button disabled={!canPlay || loggedInPlayer.pendingDiscard}>Play</button>;
        }

        if (doesCardPaymentRequirePlayerInput(loggedInPlayer, card)) {
            return (
                <PaymentPopover
                    card={card}
                    onConfirmPayment={payment => {
                        playCard(card, payment);
                    }}
                >
                    <button>Play</button>
                </PaymentPopover>
            );
        }

        return <button onClick={() => playCard(card)}>Play</button>;
    }

    const cards = (
        <PlayerHandBase>
            {player.cards
                ? player.cards.map(card => {
                      const [canPlay, reason] = context.canPlayCard(card, state);
                      return (
                          <CardComponent key={card.name} content={card}>
                              {renderPlayCardButton(card, canPlay)}
                              {!canPlay && (
                                  <CardDisabledText>
                                      <em>{reason}</em>
                                  </CardDisabledText>
                              )}
                          </CardComponent>
                      );
                  })
                : 'No cards in hand.'}
        </PlayerHandBase>
    );

    let hiddenCardsMessage;
    if (isCorporationSelection) {
        hiddenCardsMessage = `You can't count ${player.username}'s hand until everyone's ready.`;
    } else if (isBuyOrDiscard) {
        hiddenCardsMessage = `${player.corporation.name} had ${player.previousCardsInHand || 0} card
        ${player.previousCardsInHand === 1 ? '' : 's'} at the end of the previous round.`;
    } else {
        hiddenCardsMessage = `${player.corporation.name} has ${player.cards.length} card
        ${player.cards.length === 1 ? '' : 's'} in hand.`;
    }

    if (player.index === loggedInPlayer.index) {
        return <PlayerHandBase>{cards}</PlayerHandBase>;
    } else {
        return <PlayerHandBase>{hiddenCardsMessage}</PlayerHandBase>;
    }
};

export const PlayerPlayedCards = ({player}: {player: PlayerState}) => {
    const store = useStore<RootState>();
    const state = store.getState();
    const context = useContext(AppContext);
    const loggedInPlayer = context.getLoggedInPlayer(state);
    const isLoggedInPlayer = player.index === loggedInPlayer.index;

    return (
        <PlayerHandBase>
            {player.playedCards.map(card => {
                let resources = '';
                const {storedResourceType: type, storedResourceAmount: amount} = card;
                if (type) {
                    resources = `Holds ${amount} ${getResourceName(type)}${
                        amount === 1 ? '' : 's'
                    }`;
                }

                return (
                    <CardComponent
                        content={card}
                        key={card.name}
                        isHidden={!isLoggedInPlayer && card.type === CardType.EVENT}
                    >
                        {resources && <CardText>{resources}</CardText>}

                        <CardActionElements
                            player={player}
                            isLoggedInPlayer={isLoggedInPlayer}
                            card={card}
                        />
                    </CardComponent>
                );
            })}
        </PlayerHandBase>
    );
};
