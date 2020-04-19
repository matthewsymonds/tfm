import {useState, useEffect, useContext} from 'react';
import {Resource} from '../constants/resource';
import {Card} from '../models/card';
import {CardSelector} from '../components/card-selector';
import {MaybeVisible} from '../components/maybe-visible';
import styled from 'styled-components';
import React from 'react';
import {useSelector, useDispatch, useStore} from 'react-redux';
import {GameStage} from '../constants/game';

import {
    setCorporation,
    setCards,
    goToGameStage,
    discardCards,
    payForCards,
    startOver
} from '../actions';
import {useTypedSelector, RootState} from '../reducer';
import {AppContext} from '../context/app-context';
import {Amount} from '../constants/action';

const MarginalButton = styled.button`
    margin-top: 10px;
    margin-bottom: 10px;
`;

const ConfirmButton = props => (
    <MarginalButton {...props}>Confirm corporation and cards</MarginalButton>
);

function getStartingAmount(corporation: Card): number {
    if (!corporation) return 0;

    return Number(corporation.gainResource[Resource.MEGACREDIT] || 0);
}

export const CorporationSelection = ({playerIndex}: {playerIndex: number}) => {
    const dispatch = useDispatch();
    const context = useContext(AppContext);
    const store = useStore<RootState>();

    const state = store.getState();

    const corporation = useTypedSelector(state => state.players[playerIndex].corporation);
    const possibleCorporations = useTypedSelector(
        state => state.players[playerIndex].possibleCorporations
    );
    const possibleCards = useTypedSelector(state => state.players[playerIndex].possibleCards);
    const cards = useTypedSelector(state => state.players[playerIndex].cards);

    const corporationName = corporation && corporation.name;
    const startingAmount = (corporation && getStartingAmount(corporation)) || 0;
    const totalCardCost = cards.length * 3;
    const remaining = (startingAmount && startingAmount - totalCardCost) || 0;

    // If they switch to a corporation that can't afford the currently seleted cards,
    // clear all the cards.
    useEffect(() => {
        if (startingAmount && startingAmount < cards.length * 3) {
            dispatch(setCards([], playerIndex));
        }
    }, [corporationName, cards]);
    const selectAllCards = (possibleCards || []).slice(0, Math.floor(startingAmount / 3));

    function handleSelectAll() {
        dispatch(setCards(selectAllCards, playerIndex));
    }

    function handleStartOver() {
        dispatch(startOver());
    }

    return (
        <>
            <button onClick={() => handleStartOver()}>Start over</button>
            <h3>Select a corporation</h3>
            <CardSelector
                width={400}
                max={1}
                selectedCards={corporation ? [corporation] : []}
                onSelect={([corporation]) => dispatch(setCorporation(corporation, playerIndex))}
                options={possibleCorporations || []}
                orientation="horizontal"
            />
            <h3>Select up to 10 cards</h3>
            <MaybeVisible left={true} visible={!!startingAmount}>
                <h4>
                    You start with {startingAmount}€. You have {remaining}€ remaining.
                </h4>
            </MaybeVisible>
            {cards.length < selectAllCards.length ? (
                <button onClick={() => handleSelectAll()}>Select all</button>
            ) : (
                <button onClick={() => dispatch(setCards([], playerIndex))}>Unselect all</button>
            )}
            <CardSelector
                max={10}
                width={250}
                selectedCards={corporationName ? cards : []}
                onSelect={cards => dispatch(setCards(cards, playerIndex))}
                options={possibleCards || []}
                budget={remaining}
                orientation="vertical"
            />
            <MaybeVisible visible={!!corporationName}>
                <ConfirmButton
                    onClick={() => {
                        context.playCard(corporation!, state);
                        context.processQueue(dispatch);
                        dispatch(
                            discardCards(
                                possibleCards.filter(card => !cards.includes(card)),
                                playerIndex
                            )
                        );
                        dispatch(payForCards(cards, playerIndex));
                        dispatch(goToGameStage(GameStage.ACTIVE_ROUND));
                    }}
                />
            </MaybeVisible>
        </>
    );
};
