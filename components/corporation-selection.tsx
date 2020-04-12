import {useState, useEffect} from 'react';
import {Resource} from '../constants/resource';
import {Card} from '../models/card';
import {CardSelector} from '../components/card-selector';
import {MaybeVisible} from '../components/maybe-visible';
import styled from 'styled-components';
import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {GameStage} from '../constants/game';

import {setCorporation, setCards, goToGameStage, confirmCorporationAndCards} from '../actions';
import {useTypedSelector} from '../reducer';

const MarginalButton = styled.button`
    margin-top: 10px;
    margin-bottom: 10px;
`;

const ConfirmButton = props => (
    <MarginalButton {...props}>Confirm corporation and cards</MarginalButton>
);

function getStartingAmount(corporation: Card): number {
    if (!corporation) return 0;

    return corporation.gainResource[Resource.MEGACREDIT];
}

export const CORPORATION_SELECTION = ({playerId}: {playerId: number}) => {
    const dispatch = useDispatch();

    const corporation = useTypedSelector(state => state.players[playerId].corporation);
    const possibleCorporations = useTypedSelector(
        state => state.players[playerId].possibleCorporations
    );
    const startingCards = useTypedSelector(state => state.players[playerId].startingCards);
    const cards = useTypedSelector(state => state.players[playerId].cards);

    const corporationName = corporation && corporation.name;
    const startingAmount = getStartingAmount(corporation);
    const totalCardCost = cards.length * 3;
    const remaining = (startingAmount && startingAmount - totalCardCost) || 0;

    // If they switch to a corporation that can't afford the currently seleted cards,
    // clear all the cards.
    useEffect(() => {
        if (startingAmount && startingAmount < cards.length * 3) {
            dispatch(setCards(playerId, []));
        }
    }, [corporationName, cards]);

    return (
        <>
            <h3>Select a corporation</h3>
            <CardSelector
                width={400}
                max={1}
                selectedCards={[corporation]}
                onSelect={([corporation]) => dispatch(setCorporation(corporation, playerId))}
                options={possibleCorporations}
                orientation="horizontal"
            />
            <h3>Select up to 10 cards</h3>
            <MaybeVisible left={true} visible={!!startingAmount}>
                <h4>
                    You start with {startingAmount}€. You have {remaining}€ remaining.
                </h4>
            </MaybeVisible>
            {cards.length < 10 ? (
                <button onClick={() => dispatch(setCards(startingCards, playerId))}>
                    Select all
                </button>
            ) : (
                <button onClick={() => dispatch(setCards([], playerId))}>Unselect all</button>
            )}
            <CardSelector
                max={10}
                width={250}
                selectedCards={corporationName ? cards : []}
                onSelect={cards => dispatch(setCards(cards, playerId))}
                options={startingCards}
                budget={remaining}
                orientation="vertical"
            />
            <MaybeVisible visible={!!corporationName}>
                <ConfirmButton
                    onClick={() => {
                        dispatch(confirmCorporationAndCards(playerId));
                        dispatch(goToGameStage(GameStage.ACTIVE_ROUND));
                    }}
                />
            </MaybeVisible>
        </>
    );
};
