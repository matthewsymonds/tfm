import React, {ReactElement, useContext, useEffect} from 'react';
import {useDispatch, useStore} from 'react-redux';
import {
    announceReadyToStartRound,
    discardCards,
    drawPossibleCards,
    payForCards,
    setCards,
    setSelectedCards,
} from 'actions';
import {CardSelector} from 'components/card-selector';
import {Resource} from 'constants/resource';
import {AppContext} from 'context/app-context';
import {useSyncState} from 'pages/sync-state';
import {RootState, useTypedSelector} from 'reducer';
import {ActionBar, ActionBarRow} from './action-bar';
import {Button} from './button';

const ConfirmButton = props => (
    <Button marginTop="10px" marginBottom="10px" {...props}>
        Confirm card choice
    </Button>
);

export const BuyOrDiscard = ({playerIndex}: {playerIndex: number}) => {
    const dispatch = useDispatch();
    const context = useContext(AppContext);
    const store = useStore<RootState>();

    const state = store.getState();

    const corporation = useTypedSelector(state => state.players[playerIndex].corporation);
    const possibleCards = useTypedSelector(state => state.players[playerIndex].possibleCards);
    const cards = useTypedSelector(state => state.players[playerIndex].selectedCards);
    const cardsAlreadyInHand = useTypedSelector(state => state.players[playerIndex].cards);
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
            dispatch(setSelectedCards([], playerIndex));
        }
    }, [cards]);
    const selectAllCards = (possibleCards || []).slice(0, Math.floor(startingAmount / 3));

    function handleSelectAll() {
        dispatch(setSelectedCards(selectAllCards, playerIndex));
    }

    const additionalRow: ReactElement = (
        <>
            <ActionBarRow>
                <div>
                    Selected {cards.length} cards for {cards.length * 3}€. You have {remaining}€
                    remaining.
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
                        dispatch(setCards([...cardsAlreadyInHand, ...cards], playerIndex));
                        dispatch(setSelectedCards([], playerIndex));
                        dispatch(
                            discardCards(
                                possibleCards.filter(card => !cards.includes(card)),
                                playerIndex
                            )
                        );
                        dispatch(payForCards(cards, playerIndex));
                        dispatch(announceReadyToStartRound(playerIndex));
                    }}
                />
            </ActionBarRow>
        </>
    );

    const prompt = <h1>Buy cards</h1>;

    const playersStillMakingDecisions = useTypedSelector<string[]>(state =>
        state.players.filter(player => player.action === 0).map(player => player.username)
    );
    const playersWhoAreReady = useTypedSelector<string[]>(state =>
        state.players.filter(player => player.action === 1).map(player => player.username)
    );

    useSyncState();

    return (
        <>
            <ActionBar>
                <ActionBarRow>
                    <div>
                        {prompt}
                        <div>Playing {corporation?.name}</div>
                    </div>
                </ActionBarRow>
                <ActionBarRow>
                    <ul>
                        <li>
                            Players still making decisions: {playersStillMakingDecisions.join(', ')}
                        </li>
                        <li>Players who are ready: {playersWhoAreReady.join(', ')}</li>
                    </ul>
                </ActionBarRow>
            </ActionBar>
            <CardSelector
                max={10}
                cardWidth={250}
                selectedCards={corporationName ? cards : []}
                onSelect={cards => dispatch(setSelectedCards(cards, playerIndex))}
                options={possibleCards || []}
                budget={remaining}
                orientation="vertical"
            />
            <ActionBar className="bottom">{additionalRow}</ActionBar>
        </>
    );
};
