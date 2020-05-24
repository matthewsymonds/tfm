import {useRouter} from 'next/router';
import React, {MouseEvent, useContext, useEffect, useState} from 'react';
import {useDispatch, useStore} from 'react-redux';
import styled, {createGlobalStyle} from 'styled-components';
import {
    completeAction,
    discardCards,
    discardRevealedCards,
    markCardActionAsPlayed,
    moveCardFromHandToPlayArea,
    setSelectedCards,
    skipAction,
} from 'actions';
import AskUserToConfirmResourceActionDetails from 'components/ask-user-to-confirm-resource-action-details';
import CardPaymentPopover from 'components/popovers/card-payment';
import {Switcher} from 'components/switcher';
import {Action} from 'constants/action';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource';
import {AppContext, doesCardPaymentRequiresPlayerInput} from 'context/app-context';
import {Card} from 'models/card';
import {useSyncState} from 'pages/sync-state';
import {RootState, useTypedSelector} from 'reducer';
import {getHumanReadableTileName} from 'selectors/get-human-readable-tile-name';
import {getWaitingMessage} from 'selectors/get-waiting-message';
import {ActionBar, ActionBarRow} from './action-bar';
import Awards from './board/awards';
import {Board} from './board/board';
import Milestones from './board/milestones';
import StandardProjects from './board/standard-projects';
import {Box, Flex, Panel} from './box';
import {CardComponent, CardText} from './card';
import {CardSelector} from './card-selector';
import {PlayerResourceBoard} from './resource';
import {PlayerOverview} from './player-overview';
import GlobalParams from './global-params';

const Hand = styled.div`
    display: flex;
    align-items: stretch;
    justify-content: flex-start;
    width: 100%;
    overflow-y: auto;
    flex-wrap: wrap;
`;

const Info = styled.div`
    font-family: sans-serif;
    font-size: 12px;
    margin-right: 4px;
    display: flex;
    align-items: center;
`;

const GlobalStyle = createGlobalStyle`
    body {
        background: #212121;     
    }
`;

const ActionBarButton = styled.button`
    display: inline;
    margin-left: 4px;
    width: fit-content;
    min-width: 0px;
    padding-left: 8px;
    padding-right: 8px;
    padding-top: 6px;
    padding-bottom: 6px;
`;

function getResourceHumanName(resource: Resource): string {
    let result = String(resource);
    return result.slice('resource'.length).toLowerCase();
}

export const ActiveRound = ({playerIndex}: {playerIndex: number}) => {
    const player = useTypedSelector(state => state.players[playerIndex]);
    const turn = useTypedSelector(state => state.common.turn);
    const action = player.action;
    const generation = useTypedSelector(state => state.common.generation);
    const store = useStore<RootState>();
    const state = store.getState();
    const dispatch = useDispatch();
    const context = useContext(AppContext);
    const [cardsToDiscard, setCardsToDiscard] = useState<Set<Card>>(new Set());

    const [isCardPaymentPopoverOpen, setIsCardPaymentPopoverOpen] = useState(false);
    const [cardPendingPayment, setCardPendingPayment] = useState<Card | null>(null);

    function handleCardClick(card) {
        if (player.pendingVariableAmount?.resource === Resource.CARD) {
            const newCardsToDiscard = new Set(cardsToDiscard);
            if (cardsToDiscard.has(card)) {
                newCardsToDiscard.delete(card);
            } else {
                newCardsToDiscard.add(card);
            }
            setCardsToDiscard(newCardsToDiscard);
        }
    }

    useSyncState();

    useEffect(() => {
        context.processQueue(dispatch);
    }, []);

    function playCard(card: Card, payment?: PropertyCounter<Resource>) {
        dispatch(moveCardFromHandToPlayArea(card, playerIndex));
        context.playCard(card, store.getState(), payment);
        // Have to trigger effects from the card we just played.
        // Must be processed separatedly in case the card affects itself.
        context.triggerEffectsFromPlayedCard(
            card.cost || 0,
            card.tags,
            // refreshed state so that the card we just played is present.
            store.getState()
        );
        context.processQueue(dispatch);
    }

    function handlePlayCard(card: Card) {
        if (doesCardPaymentRequiresPlayerInput(card)) {
            setCardPendingPayment(card);
            setIsCardPaymentPopoverOpen(true);
        } else {
            playCard(card);
        }
    }

    function handleConfirmCardPayment(payment: PropertyCounter<Resource>) {
        if (!cardPendingPayment) {
            throw new Error('No card pending payment');
        }
        playCard(cardPendingPayment, payment);
        setIsCardPaymentPopoverOpen(false);
        setCardPendingPayment(null);
    }

    function confirmDiscardSelection() {
        dispatch(discardCards(Array.from(cardsToDiscard), playerIndex));
        context.processQueue(dispatch);
        setCardsToDiscard(new Set());
    }

    function playAction(card: Card, action: Action) {
        dispatch(markCardActionAsPlayed(card, playerIndex));
        context.playAction(action, state, card);
        context.queue.push(completeAction(playerIndex));
        context.processQueue(dispatch);
    }

    const players = useTypedSelector(state => state.players);

    function cardActionElements(card: Card) {
        if (!card.action) return null;

        const options = card.action.choice || [card.action];

        if (card.usedActionThisRound) {
            return (
                <CardText>
                    <em>Used action this round</em>
                </CardText>
            );
        }

        return options.map((option, index) => {
            const [canPlay, reason] = context.canPlayAction(option, state, card);
            return (
                <React.Fragment key={index}>
                    <button disabled={!canPlay} onClick={() => playAction(card, option)}>
                        {options.length === 1 ? 'Play Action' : option.text}
                    </button>
                    {!canPlay && reason ? (
                        <CardText>
                            <em>{reason}</em>
                        </CardText>
                    ) : null}
                </React.Fragment>
            );
        });
    }

    function continueAfterRevealingCards() {
        context.queue.push(discardRevealedCards());
        context.processQueue(dispatch);
    }

    const waitingMessage = getWaitingMessage(playerIndex, state);

    const router = useRouter();

    const totalCardCost = player.selectedCards.length * 3;
    const playerMoney = player.resources[Resource.MEGACREDIT];
    const remaining = player.buyCards ? playerMoney - totalCardCost : playerMoney;
    const numCardsToTake = player.buyCards ? player.possibleCards.length : player.numCardsToTake;
    const lookAtCardsPrompt = `Select ${player.buyCards ? 'up to ' : ''}${numCardsToTake} card${
        numCardsToTake !== 1 ? 's' : ''
    } to ${player.buyCards ? 'buy' : 'take'}`;
    const cannotContinueAfterLookingAtCards =
        totalCardCost > playerMoney ||
        (player.numCardsToTake !== null && player.selectedCards.length < player.numCardsToTake);

    const showBottomActionBar =
        player.pendingTilePlacement ||
        player.pendingVariableAmount ||
        player.pendingResourceOption ||
        state.common.revealedCards.length > 0 ||
        player.possibleCards.length > 0 ||
        player.pendingResourceTargetConfirmation ||
        player.pendingResourceActionDetails;
    return (
        <>
            <GlobalStyle />
            <ActionBar>
                <ActionBarRow>
                    <Flex width="100%" justifyContent="space-between">
                        <Info>
                            {!action && 'You have passed'}
                            {action && (waitingMessage || `Action ${action} of 2`)}
                            {action && (
                                <ActionBarButton
                                    disabled={context.shouldDisableUI(state) || showBottomActionBar}
                                    onClick={() => dispatch(skipAction(playerIndex))}
                                >
                                    {action === 2 ? 'Skip 2nd action' : 'Pass'}
                                </ActionBarButton>
                            )}
                        </Info>
                        <Info>
                            Gen {generation}, Turn {turn}
                            <ActionBarButton onClick={() => router.push('/')}>Home</ActionBarButton>
                        </Info>
                    </Flex>
                </ActionBarRow>
            </ActionBar>
            <Flex width="calc(100% - 32px)" margin="16px">
                <Box>
                    <Board
                        board={state.common.board}
                        playerIndex={playerIndex}
                        parameters={state.common.parameters}
                    />
                    <Box>
                        <GlobalParams parameters={state.common.parameters} />
                    </Box>
                    <Box>
                        <Panel>
                            <Switcher tabs={['Standard Projects', 'Milestones', 'Awards']}>
                                <StandardProjects />
                                <Milestones />
                                <Awards />
                            </Switcher>
                        </Panel>
                    </Box>
                </Box>

                <Box marginLeft="16px" flexGrow="1">
                    <Box>
                        <Switcher tabs={players.map(player => player.corporation?.name)}>
                            {players.map((thisPlayer, thisPlayerIndex) => {
                                const cards = (
                                    <Hand>
                                        {thisPlayer.cards.map(card => {
                                            const [canPlay, reason] = context.canPlayCard(
                                                card,
                                                state
                                            );
                                            return (
                                                <CardComponent
                                                    content={card}
                                                    width={250}
                                                    key={card.name}
                                                    onClick={(e: MouseEvent<HTMLDivElement>) =>
                                                        handleCardClick(card)
                                                    }
                                                    selected={cardsToDiscard.has(card)}
                                                >
                                                    {!canPlay && (
                                                        <CardText>
                                                            <em>{reason}</em>
                                                        </CardText>
                                                    )}
                                                    {playerIndex === thisPlayerIndex ? (
                                                        <button
                                                            disabled={
                                                                !context.canPlayCard(
                                                                    card,
                                                                    state
                                                                )[0] ||
                                                                player.pendingVariableAmount
                                                                    ?.resource === Resource.CARD
                                                            }
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
                                            <CardPaymentPopover
                                                isOpen={isCardPaymentPopoverOpen}
                                                target={cardPendingPayment.name.replace(
                                                    /\s+/g,
                                                    '-'
                                                )}
                                                card={cardPendingPayment}
                                                toggle={() =>
                                                    setIsCardPaymentPopoverOpen(
                                                        !isCardPaymentPopoverOpen
                                                    )
                                                }
                                                onConfirmPayment={(...args) =>
                                                    handleConfirmCardPayment(...args)
                                                }
                                            />
                                        )}
                                    </Hand>
                                );
                                const playedCards = (
                                    <Hand>
                                        {thisPlayer.playedCards.map(card => {
                                            let resources = '';
                                            const {
                                                storedResourceType: type,
                                                storedResourceAmount: amount,
                                            } = card;
                                            if (type) {
                                                resources = `Holds ${amount} ${getResourceHumanName(
                                                    type
                                                )}${amount === 1 ? '' : 's'}`;
                                            }
                                            return (
                                                <CardComponent
                                                    content={card}
                                                    width={250}
                                                    key={card.name}
                                                >
                                                    {resources && <CardText>{resources}</CardText>}

                                                    {cardActionElements(card)}
                                                </CardComponent>
                                            );
                                        })}
                                    </Hand>
                                );

                                return (
                                    <React.Fragment key={thisPlayerIndex}>
                                        <Panel>
                                            <PlayerOverview
                                                player={thisPlayer}
                                                isLoggedInPlayer={playerIndex === thisPlayerIndex}
                                            />
                                        </Panel>
                                        <Panel>
                                            <Switcher
                                                tabs={
                                                    playerIndex === thisPlayerIndex
                                                        ? ['Hand', 'Played Cards']
                                                        : ['Played Cards']
                                                }
                                            >
                                                {playerIndex === thisPlayerIndex
                                                    ? [cards, playedCards]
                                                    : [playedCards]}
                                            </Switcher>
                                        </Panel>
                                    </React.Fragment>
                                );
                            })}
                        </Switcher>
                    </Box>
                </Box>
            </Flex>
            {showBottomActionBar && (
                <ActionBar className="bottom">
                    <ActionBarRow>
                        {player.possibleCards.length > 0 && (
                            <Flex flexDirection="column">
                                <h3>{lookAtCardsPrompt}</h3>
                                <CardSelector
                                    max={player.numCardsToTake || Infinity}
                                    cardWidth={250}
                                    selectedCards={player.selectedCards}
                                    onSelect={cards =>
                                        dispatch(setSelectedCards(cards, playerIndex))
                                    }
                                    options={player.possibleCards}
                                    budget={remaining}
                                    orientation="vertical"
                                />
                                <button
                                    disabled={cannotContinueAfterLookingAtCards}
                                    onClick={() => context.processQueue(dispatch)}
                                >
                                    {player.buyCards ? 'Confirm' : 'Take cards'}
                                </button>
                            </Flex>
                        )}
                        {player.pendingTilePlacement && (
                            <h3>
                                Place the{' '}
                                {getHumanReadableTileName(player.pendingTilePlacement.type)} tile.
                            </h3>
                        )}
                        {player.pendingResourceActionDetails && (
                            <AskUserToConfirmResourceActionDetails
                                player={player}
                                resourceActionDetails={player.pendingResourceActionDetails}
                            />
                        )}
                        {state.common.revealedCards.map((card, index) => {
                            return (
                                <CardComponent key={index} width={250} content={card}>
                                    {index === state.common.revealedCards.length - 1 ? (
                                        <button onClick={continueAfterRevealingCards}>
                                            Continue
                                        </button>
                                    ) : null}
                                </CardComponent>
                            );
                        })}
                    </ActionBarRow>
                </ActionBar>
            )}
        </>
    );
};
