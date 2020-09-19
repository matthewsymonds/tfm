import {ApiClient} from 'api-client';
import {ActionGuard} from 'client-server-shared/action-guard';
import {Flex} from 'components/box';
import {CardActionElements, CardComponent, CardDisabledText, CardText} from 'components/card';
import PaymentPopover from 'components/popovers/payment-popover';
import {TagIcon} from 'components/tags';
import {CardType} from 'constants/card-types';
import {GameStage} from 'constants/game';
import {PropertyCounter} from 'constants/property-counter';
import {getResourceName, Resource} from 'constants/resource';
import {Tag} from 'constants/tag';
import {AppContext, doesCardPaymentRequirePlayerInput} from 'context/app-context';
import {Card} from 'models/card';
import React, {useContext} from 'react';
import {useDispatch, useStore} from 'react-redux';
import {GameState, PlayerState, useTypedSelector} from 'reducer';
import {getTagCountsByName} from 'selectors/player';
import styled from 'styled-components';

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
    const store = useStore<GameState>();
    const state = store.getState();

    const gameStage = useTypedSelector(state => state?.common?.gameStage);

    const loggedInPlayer = context.getLoggedInPlayer(state);
    const isCorporationSelection = gameStage === GameStage.CORPORATION_SELECTION;
    const isBuyOrDiscard = gameStage === GameStage.BUY_OR_DISCARD;

    const apiClient = new ApiClient(dispatch);
    const actionGuard = new ActionGuard({state, queue: context.queue}, loggedInPlayer.username);

    function playCard(card: Card, payment?: PropertyCounter<Resource>) {
        apiClient.playCardAsync({card, payment});
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
                      const [canPlay, reason] = actionGuard.canPlayCard(card);
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

    const numCards = player.cards.length;
    const numPreviousCards = player.previousCardsInHand || 0;

    let numCardsMessage;
    if (isCorporationSelection) {
        numCardsMessage = `You can't count ${player.username}'s hand until everyone's ready.`;
    } else if (isBuyOrDiscard) {
        numCardsMessage = `${player.corporation.name} had ${numPreviousCards} card
        ${numPreviousCards === 1 ? '' : 's'} at the end of the previous round.`;
    } else {
        numCardsMessage = `${player.corporation.name} has ${player.cards.length} card${
            numCards === 1 ? '' : 's'
        } in hand.`;
    }

    if (player.index === loggedInPlayer.index) {
        return <PlayerHandBase>{numCards > 0 ? cards : numCardsMessage}</PlayerHandBase>;
    } else {
        return <PlayerHandBase>{numCardsMessage}</PlayerHandBase>;
    }
};

export const PlayerPlayedCards = ({player}: {player: PlayerState}) => {
    const store = useStore<GameState>();
    const state = store.getState();
    const context = useContext(AppContext);
    const loggedInPlayer = context.getLoggedInPlayer(state);
    const isLoggedInPlayer = player.index === loggedInPlayer.index;
    const tagCountsByTagName = getTagCountsByName(player);

    return (
        <React.Fragment>
            <Flex>
                {Object.keys(tagCountsByTagName).map(tag => (
                    <Flex key={tag} justifyContent="center" alignItems="center" marginRight="8px">
                        <TagIcon name={tag as Tag} />
                        {tagCountsByTagName[tag]}
                    </Flex>
                ))}
            </Flex>
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
        </React.Fragment>
    );
};
