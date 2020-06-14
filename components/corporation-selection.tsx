import React, {ReactElement, useContext, useEffect} from 'react';
import {useDispatch, useStore} from 'react-redux';
import styled from 'styled-components';
import {
    discardCards,
    moveCardFromHandToPlayArea,
    payForCards,
    setCards,
    setCorporation,
    setSelectedCards,
    announceReadyToStartRound,
} from 'actions';
import {CardSelector} from 'components/card-selector';
import {Resource} from 'constants/resource';
import {AppContext} from 'context/app-context';
import {Card} from 'models/card';
import {useSyncState} from 'hooks/sync-state';
import {RootState, useTypedSelector} from 'reducer';
import {ActionBar, ActionBarRow} from './action-bar';
import {CardComponent} from './card';

const MarginalButton = styled.button`
    margin-top: 10px;
    margin-bottom: 10px;
`;

const Prompt = styled.div`
    flex: none;
    width: 250px;
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

    const playersStillMakingDecisions = useTypedSelector<string[]>(state =>
        state.players.filter(player => player.action === 0).map(player => player.username)
    );
    const playersWhoAreReady = useTypedSelector<string[]>(state =>
        state.players.filter(player => player.action === 1).map(player => player.username)
    );

    // If they switch to a corporation that can't afford the currently seleted cards,
    // clear all the cards.
    useEffect(() => {
        if (startingAmount && startingAmount < cards.length * 3) {
            dispatch(setSelectedCards([], playerIndex));
        }
    }, [corporationName, cards]);
    const selectAllCards = (possibleCards || []).slice(0, Math.floor(startingAmount / 3));

    function handleSelectAll() {
        dispatch(setSelectedCards(selectAllCards, playerIndex));
    }
    useSyncState();

    const player = context.getLoggedInPlayer(state);

    let additionalRow: ReactElement | null = null;
    if (corporationName && player.action === 0) {
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
                            const corporationCard = corporation as Card;

                            dispatch(setCards(cards, playerIndex));
                            dispatch(setSelectedCards([], playerIndex));
                            dispatch(moveCardFromHandToPlayArea(corporationCard, playerIndex));
                            context.playCard(corporationCard, state);
                            context.triggerEffectsFromPlayedCard(corporationCard, store.getState());
                            dispatch(
                                discardCards(
                                    possibleCards.filter(card => !cards.includes(card)),
                                    playerIndex
                                )
                            );
                            dispatch(payForCards(cards, playerIndex));
                            dispatch(announceReadyToStartRound(playerIndex));
                            context.processQueue(dispatch);
                        }}
                    />
                </ActionBarRow>
            </>
        );
    } else if (corporationName && player.action === 1) {
        additionalRow = (
            <ActionBarRow>
                <div>Waiting for other players.</div>
            </ActionBarRow>
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
                    </Prompt>
                    {player.action !== 1 ? (
                        <CardSelector
                            max={1}
                            selectedCards={corporation ? [corporation] : []}
                            onSelect={([corporation]) =>
                                dispatch(setCorporation(corporation, playerIndex))
                            }
                            options={possibleCorporations || []}
                            orientation="horizontal"
                        />
                    ) : (
                        <CardComponent content={corporation!} />
                    )}
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
            {additionalRow && <ActionBar className="bottom">{additionalRow}</ActionBar>}
        </>
    );
};
