import {useContext, MouseEvent} from 'react';
import {useStore} from 'react-redux';
import styled from 'styled-components';

import {Switcher} from 'components/switcher';
import {useTypedSelector, RootState} from 'reducer';
import {Flex, Box} from 'components/box';
import {Square} from 'components/square';
import {GameStage} from 'constants/game';
import {AppContext} from 'context/app-context';
import {CardActionElements, CardComponent, CardDisabledText, CardText} from 'components/card';

const Hand = styled.div`
    display: flex;
    align-items: stretch;
    justify-content: flex-start;
    width: 100%;
    overflow-y: auto;
    flex-wrap: wrap;
`;

const RightBox = styled.div`
    width: 100%;
    flex-grow: 1;
`;

const HiddenCardsMessage = styled.div`
    margin: 16px;
`;

type PlayerPanelProps = {
    loggedInPlayerIndex: number;
};

export const PlayerPanel = ({loggedInPlayerIndex}: PlayerPanelProps) => {
    /**
     * State (todo: use selectors everywhere instead)
     */
    const store = useStore<RootState>();
    const state = store.getState();

    /**
     * Hooks
     */
    const context = useContext(AppContext);

    /**
     * State selectors
     */
    const players = useTypedSelector(state => state.players);
    const loggedInPlayer = useTypedSelector(state => state.players[loggedInPlayerIndex]);
    const gameStage = useTypedSelector(state => state?.common?.gameStage);

    /**
     * Derived state
     */
    const isCorporationSelection = gameStage === GameStage.CORPORATION_SELECTION;
    const isBuyOrDiscard = gameStage === GameStage.BUY_OR_DISCARD;
    const sortedPlayers = [...players].sort(
        (a, b) =>
            state.common.playerIndexOrderForGeneration.indexOf(a.index) -
            state.common.playerIndexOrderForGeneration.indexOf(b.index)
    );

    /**
     * Event handlers
     */
    // For selecting cards to discard
    // TODO: move sell patents logic to redux state with selectedCards
    function handleCardClick(card) {
        if (loggedInPlayer.pendingDiscard) {
            let newCardsToDiscard = [...cardsToDiscard];
            if (newCardsToDiscard.includes(card)) {
                newCardsToDiscard = newCardsToDiscard.filter(c => c !== card);
            } else {
                newCardsToDiscard.push(card);
                while (newCardsToDiscard.length > maxCardsToDiscard) {
                    newCardsToDiscard.shift();
                }
            }
            setCardsToDiscard(newCardsToDiscard);
        }
    }

    return (
        <Switcher
            defaultTabIndex={sortedPlayers.indexOf(loggedInPlayer)}
            tabs={sortedPlayers.map(player => (
                <Flex flexDirection="row" alignItems="center" key={player.index}>
                    <Box display="inline-block" marginRight="8px">
                        {isCorporationSelection ? player.username : player.corporation.name}
                    </Box>
                    <Square playerIndex={player.index} />
                </Flex>
            ))}
        >
            {sortedPlayers.map(thisPlayer => {
                const handKey = thisPlayer.index + 'hand';
                const cards = (
                    <Hand key={handKey}>
                        {thisPlayer.cards.map(card => {
                            const [canPlay, reason] = context.canPlayCard(card, state);
                            return (
                                <CardComponent
                                    key={card.name}
                                    content={card}
                                    onClick={(e: MouseEvent<HTMLDivElement>) => {
                                        if (loggedInPlayerIndex !== thisPlayer.index) return;
                                        handleCardClick(card);
                                    }}
                                    selected={cardsToDiscard.includes(card)}
                                >
                                    {!canPlay && (
                                        <CardDisabledText>
                                            <em>{reason}</em>
                                        </CardDisabledText>
                                    )}
                                    {loggedInPlayerIndex === thisPlayer.index ? (
                                        <button
                                            disabled={!canPlay || loggedInPlayer.pendingDiscard}
                                            onClick={() => handlePlayCard(card)}
                                            id={card.name.replace(/\s+/g, '-')}
                                        >
                                            Play
                                        </button>
                                    ) : null}
                                </CardComponent>
                            );
                        })}
                        {cardPendingPayment && (
                            <PaymentPopover
                                isOpen={isPaymentPopoverOpen}
                                target={cardPendingPayment.name.replace(/\s+/g, '-')}
                                card={cardPendingPayment}
                                toggle={() => setIsPaymentPopoverOpen(!isPaymentPopoverOpen)}
                                onConfirmPayment={(...args) => handleConfirmCardPayment(...args)}
                            />
                        )}
                    </Hand>
                );
                const playedCardsKey = thisPlayer.index + 'playedCards';
                const playedCards = (
                    <Hand key={playedCardsKey}>
                        {thisPlayer.playedCards
                            .filter(card => card.type !== CardType.CORPORATION)
                            .map(card => {
                                let resources = '';
                                const {
                                    storedResourceType: type,
                                    storedResourceAmount: amount,
                                } = card;
                                if (type) {
                                    resources = `Holds ${amount} ${getResourceName(type)}${
                                        amount === 1 ? '' : 's'
                                    }`;
                                }

                                const isLoggedInPlayer = thisPlayer.index === loggedInPlayerIndex;
                                return (
                                    <CardComponent
                                        content={card}
                                        key={card.name}
                                        isHidden={!isLoggedInPlayer && card.type === CardType.EVENT}
                                    >
                                        {resources && <CardText>{resources}</CardText>}

                                        <CardActionElements
                                            player={thisPlayer}
                                            isLoggedInPlayer={isLoggedInPlayer}
                                            card={card}
                                        />
                                    </CardComponent>
                                );
                            })}
                    </Hand>
                );

                const cardsHiddenCorporationSelection = (
                    <HiddenCardsMessage key={handKey}>
                        You can't count {thisPlayer.username}'s hand until everyone's ready.
                    </HiddenCardsMessage>
                );

                const cardsHiddenBuyOrDiscard = (
                    <HiddenCardsMessage key={handKey}>
                        {thisPlayer.corporation.name} had {thisPlayer.previousCardsInHand || 0} card
                        {thisPlayer.previousCardsInHand === 1 ? '' : 's'} at the end of the previous
                        round.
                    </HiddenCardsMessage>
                );

                const cardsHiddenActiveRound = (
                    <HiddenCardsMessage key={handKey}>
                        {thisPlayer.corporation.name} has {thisPlayer.cards.length} card
                        {thisPlayer.cards.length === 1 ? '' : 's'} in hand.
                    </HiddenCardsMessage>
                );

                const noPlayedCardsMessage = (
                    <HiddenCardsMessage key={playedCardsKey}>
                        No cards played yet.
                    </HiddenCardsMessage>
                );

                const noCardsInHandMessage = (
                    <HiddenCardsMessage key={handKey}>No cards in hand.</HiddenCardsMessage>
                );

                const isLoggedInPlayer = thisPlayer.index === loggedInPlayerIndex;

                const cardsHidden = isCorporationSelection
                    ? cardsHiddenCorporationSelection
                    : isBuyOrDiscard
                    ? cardsHiddenBuyOrDiscard
                    : cardsHiddenActiveRound;

                const playedCardsExcludingCorp = thisPlayer.playedCards.filter(
                    card => card.type !== CardType.CORPORATION
                );

                return (
                    <React.Fragment key={thisPlayer.index}>
                        <Flex flexDirection="column" justifyContent="stretch">
                            <Panel>
                                <PlayerOverview
                                    player={thisPlayer}
                                    isLoggedInPlayer={loggedInPlayerIndex === thisPlayer.index}
                                />
                            </Panel>
                            <Panel>
                                <Switcher
                                    color={colors[thisPlayer.index]}
                                    tabs={['Hand', 'Played Cards']}
                                    defaultTabIndex={0}
                                >
                                    {[
                                        !isLoggedInPlayer
                                            ? cardsHidden
                                            : thisPlayer.cards.length === 0
                                            ? noCardsInHandMessage
                                            : cards,
                                        playedCardsExcludingCorp.length > 0
                                            ? playedCards
                                            : noPlayedCardsMessage,
                                    ]}
                                </Switcher>
                            </Panel>
                        </Flex>
                    </React.Fragment>
                );
            })}
        </Switcher>
    );
};
