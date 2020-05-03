import {useState, useEffect, useContext, ReactElement} from 'react';
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
    startOver,
    startRound,
    drawPossibleCards
} from '../actions';
import {useTypedSelector, RootState} from '../reducer';
import {AppContext} from '../context/app-context';
import {Amount} from '../constants/action';
import {ActionBar, ActionBarRow, ActionBarDivider} from './action-bar';

const MarginalButton = styled.button`
    margin-top: 10px;
    margin-bottom: 10px;
`;

const ConfirmButton = props => <MarginalButton {...props}>Confirm card choice</MarginalButton>;

export const BuyOrDiscard = ({playerIndex}: {playerIndex: number}) => {
    const dispatch = useDispatch();
    const context = useContext(AppContext);
    const store = useStore<RootState>();

    const state = store.getState();

    const corporation = useTypedSelector(state => state.players[playerIndex].corporation);
    const possibleCards = useTypedSelector(state => state.players[playerIndex].possibleCards);
    const cards = useTypedSelector(state => state.players[playerIndex].cards);
    const startingAmount = useTypedSelector(
        state => state.players[playerIndex].resources[Resource.MEGACREDIT]
    );

    useEffect(() => {
        if (possibleCards.length === 0) {
            dispatch(drawPossibleCards(4, playerIndex));
        }
    }, [possibleCards.length]);

    const corporationName = corporation && corporation.name;
    const totalCardCost = cards.length * 3;
    const remaining = (startingAmount && startingAmount - totalCardCost) || 0;

    // If they switch to a corporation that can't afford the currently seleted cards,
    // clear all the cards.
    useEffect(() => {
        if (startingAmount && startingAmount - totalCardCost < 0) {
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
    let additionalRow: ReactElement | null = null;
    if (corporationName) {
        additionalRow = (
            <>
                <ActionBarRow>
                    <div>
                        Selected {cards.length} cards for {cards.length * 3}€. You have {remaining}€
                        remaining.
                    </div>
                    {cards.length < selectAllCards.length ? (
                        <button onClick={() => handleSelectAll()}>Select all</button>
                    ) : (
                        <button onClick={() => dispatch(setCards([], playerIndex))}>
                            Unselect all
                        </button>
                    )}
                    <ConfirmButton
                        onClick={() => {
                            context.processQueue(dispatch);
                            dispatch(
                                discardCards(
                                    possibleCards.filter(card => !cards.includes(card)),
                                    playerIndex
                                )
                            );
                            dispatch(payForCards(cards, playerIndex));
                            dispatch(startRound());
                            dispatch(goToGameStage(GameStage.ACTIVE_ROUND));
                        }}
                    />
                </ActionBarRow>
            </>
        );
    }

    const prompt = <h1>Buy cards</h1>;

    return (
        <>
            <ActionBar>
                <ActionBarRow>
                    <div>
                        {prompt}
                        <div>Playing {corporation?.name}</div>
                    </div>
                </ActionBarRow>
            </ActionBar>
            <CardSelector
                max={10}
                width={250}
                selectedCards={corporationName ? cards : []}
                onSelect={cards => dispatch(setCards(cards, playerIndex))}
                options={possibleCards || []}
                budget={remaining}
                orientation="vertical"
            />
            {additionalRow && <ActionBar className="bottom">{additionalRow}</ActionBar>}
        </>
    );
};
