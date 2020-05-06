import React, {ReactElement, useContext, useEffect} from 'react';
import {useDispatch, useStore} from 'react-redux';
import styled from 'styled-components';
import {
    discardCards,
    drawPossibleCards,
    goToGameStage,
    moveCardFromHandToPlayArea,
    payForCards,
    setCards,
    setCorporation,
    setSelectedCards,
    startOver,
    startRound,
} from '../actions';
import {CardSelector} from '../components/card-selector';
import {GameStage} from '../constants/game';
import {Resource} from '../constants/resource';
import {AppContext} from '../context/app-context';
import {Card} from '../models/card';
import {useSyncState} from '../pages/sync-state';
import {RootState, useTypedSelector} from '../reducer';
import {ActionBar, ActionBarRow} from './action-bar';

const MarginalButton = styled.button`
    margin-top: 10px;
    margin-bottom: 10px;
`;

const Prompt = styled.div`
    min-width: 350px;
`;

const AlignLeft = styled.div`
    text-align: left;
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
    const cards = useTypedSelector(state => state.players[playerIndex].selectedCards);

    const corporationName = corporation && corporation.name;
    const startingAmount = (corporation && getStartingAmount(corporation)) || 0;
    const totalCardCost = cards.length * 3;
    const remaining = (startingAmount && startingAmount - totalCardCost) || 0;

    // If they switch to a corporation that can't afford the currently seleted cards,
    // clear all the cards.
    useEffect(() => {
        if (startingAmount && startingAmount < cards.length * 3) {
            dispatch(setSelectedCards([], playerIndex));
        }
    }, [corporationName, cards]);
    const selectAllCards = (possibleCards || []).slice(0, Math.floor(startingAmount / 3));

    useEffect(() => {
        if (possibleCards.length === 0) {
            dispatch(drawPossibleCards(10, playerIndex));
        }
    }, [possibleCards.length]);

    function handleSelectAll() {
        dispatch(setSelectedCards(selectAllCards, playerIndex));
    }

    function handleStartOver() {
        dispatch(startOver());
    }
    useSyncState();

    let additionalRow: ReactElement | null = null;
    if (corporationName) {
        additionalRow = (
            <>
                <ActionBarRow>
                    <div>
                        You start with {startingAmount}€. You have {remaining}€ remaining.
                    </div>
                    {cards.length < selectAllCards.length ? (
                        <button onClick={() => handleSelectAll()}>Select all</button>
                    ) : (
                        <button onClick={() => dispatch(setSelectedCards([], playerIndex))}>
                            Unselect all
                        </button>
                    )}
                    <ConfirmButton
                        onClick={() => {
                            dispatch(setCards(cards, playerIndex));
                            dispatch(setSelectedCards([], playerIndex));
                            const card = corporation!;
                            dispatch(moveCardFromHandToPlayArea(card, playerIndex));

                            context.playCard(card, state);
                            context.triggerEffectsFromPlayedCard(0, card.tags, store.getState());
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

    let prompt = <h3>Select a corporation</h3>;
    if (corporationName) {
        prompt = <h3>Selected {corporationName}</h3>;
    }

    return (
        <>
            <ActionBar>
                <ActionBarRow>
                    <Prompt>
                        <div>{prompt}</div>
                        <button onClick={() => handleStartOver()}>Start over</button>
                    </Prompt>
                    <CardSelector
                        className="inline"
                        width={400}
                        max={1}
                        selectedCards={corporation ? [corporation] : []}
                        onSelect={([corporation]) =>
                            dispatch(setCorporation(corporation, playerIndex))
                        }
                        options={possibleCorporations || []}
                        orientation="horizontal"
                    />
                </ActionBarRow>
            </ActionBar>
            <CardSelector
                max={10}
                width={250}
                selectedCards={corporationName ? cards : []}
                onSelect={cards => dispatch(setSelectedCards(cards, playerIndex))}
                options={possibleCards || []}
                budget={remaining}
                orientation="vertical"
            />
            {additionalRow && <ActionBar className="bottom">{additionalRow}</ActionBar>}
        </>
    );
};
