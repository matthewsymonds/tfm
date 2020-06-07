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
import PaymentPopover from 'components/popovers/payment-popover';
import {Switcher} from 'components/switcher';
import {Action, Amount} from 'constants/action';
import {CardType} from 'constants/card-types';
import {PropertyCounter} from 'constants/property-counter';
import {Resource, getResourceName} from 'constants/resource';
import {VariableAmount} from 'constants/variable-amount';
import {AppContext, doesCardPaymentRequirePlayerInput} from 'context/app-context';
import {Card} from 'models/card';
import {useRouter} from 'next/router';
import {useSyncState} from 'pages/sync-state';
import React, {MouseEvent, useContext, useEffect, useState} from 'react';
import {useDispatch, useStore} from 'react-redux';
import {PlayerState, RootState, useTypedSelector} from 'reducer';
import {getHumanReadableTileName} from 'selectors/get-human-readable-tile-name';
import {getWaitingMessage} from 'selectors/get-waiting-message';
import styled, {createGlobalStyle} from 'styled-components';
import {ActionBar, ActionBarRow} from './action-bar';
import Awards from './board/awards';
import {Board} from './board/board';
import Milestones from './board/milestones';
import StandardProjects from './board/standard-projects';
import {Box, Flex, Panel} from './box';
import {Button} from './button';
import {CardComponent, CardText} from './card';
import {CardSelector} from './card-selector';
import GlobaclParams from './global-params';
import {PlayerOverview} from './player-overview';
import {Square} from './square';
import GlobalParams from './global-params';
import {colors} from 'constants/game';

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

function getCardDiscardAmountHumanName(amount: Amount) {
    if (amount === VariableAmount.USER_CHOICE) {
        return 'at least one';
    }

    if (amount === VariableAmount.USER_CHOICE_MIN_ZERO) {
        return 'any number of';
    }

    if (amount === VariableAmount.USER_CHOICE_UP_TO_ONE) {
        return '1 or 0';
    }

    return amount;
}

const SwitchColors = styled.div`
    > * {
        &:nth-child(2n) {
            background: #eee;
        }
    }
`;

export const ActiveRound = ({playerIndex}: {playerIndex: number}) => {
    const player = useTypedSelector(state => state.players[playerIndex]);
    const turn = useTypedSelector(state => state.common.turn);
    const action = player.action;
    const generation = useTypedSelector(state => state.common.generation);
    const store = useStore<RootState>();
    const state = store.getState();
    const dispatch = useDispatch();
    const context = useContext(AppContext);
    const [cardsToDiscard, setCardsToDiscard] = useState<Card[]>([]);
    const log = useTypedSelector(state => state.log);

    const [isPaymentPopoverOpen, setIsPaymentPopoverOpen] = useState(false);
    const [cardPendingPayment, setCardPendingPayment] = useState<Card | null>(null);
    const [actionPendingPayment, setActionPendingPayment] = useState<Action | null>(null);

    let maxCardsToDiscard: number;

    if (player.pendingDiscard === VariableAmount.USER_CHOICE) {
        maxCardsToDiscard = player.cards.length;
    } else if (player.pendingDiscard === VariableAmount.USER_CHOICE_UP_TO_ONE) {
        maxCardsToDiscard = 1;
    } else {
        maxCardsToDiscard = player.pendingDiscard as number;
    }

    let minCardsToDiscard = 0;
    if (typeof player.pendingDiscard === 'number') {
        minCardsToDiscard = player.pendingDiscard;
    }
    if (player.pendingDiscard === VariableAmount.USER_CHOICE) {
        // Can't cycle a turn with sell patents by selling 0 cards!
        minCardsToDiscard = 1;
    }

    function handleCardClick(card) {
        if (player.pendingDiscard) {
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

    useSyncState();

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
        if (doesCardPaymentRequirePlayerInput(player, card)) {
            setCardPendingPayment(card);
            setIsPaymentPopoverOpen(true);
        } else {
            playCard(card);
        }
    }

    function handleConfirmCardPayment(payment: PropertyCounter<Resource>) {
        if (!cardPendingPayment) {
            throw new Error('No card pending payment');
        }
        playCard(cardPendingPayment, payment);
        setIsPaymentPopoverOpen(false);
        setCardPendingPayment(null);
    }

    function confirmDiscardSelection() {
        dispatch(discardCards(cardsToDiscard, playerIndex));
        context.processQueue(dispatch);
        setCardsToDiscard([]);
    }

    function playAction(card: Card, action: Action, payment?: PropertyCounter<Resource>) {
        dispatch(markCardActionAsPlayed(card, playerIndex));
        context.playAction({action, state, parent: card, payment});
        context.queue.push(completeAction(playerIndex));
        context.processQueue(dispatch);
    }

    const players = useTypedSelector(state => state.players);

    function getDefaultTabIndex(thisPlayer: PlayerState) {
        if (thisPlayer.index !== playerIndex) {
            // Always show "Played cards" by default since you can't see any cards in hand!
            return 1;
        }

        // Simple heuristic.
        // If num cards in hand > num played cards with unused actions, show hand.
        return thisPlayer.cards.length >
            thisPlayer.playedCards.filter(card => card.action && !card.usedActionThisRound).length
            ? 0
            : 1;
    }

    function handlePlayCardAction(cardAction: Action, parentCard: Card) {
        if (
            cardAction.acceptedPayment ||
            (player.corporation.name === 'Helion' && player.resources[Resource.HEAT] > 0)
        ) {
            setActionPendingPayment(cardAction);
        } else {
            playAction(parentCard, cardAction);
        }
    }

    function handleConfirmActionPayment(payment: PropertyCounter<Resource>, parentCard: Card) {
        if (!actionPendingPayment) {
            throw new Error('No action pending payment');
        }
        setActionPendingPayment(null);
        playAction(parentCard, actionPendingPayment, payment);
    }

    function cardActionElements(thisPlayer: PlayerState, card: Card) {
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
            const [canPlay, reason] = context.canPlayCardAction(option, state, card);
            const canReallyPlay = canPlay && thisPlayer.index === player.index;
            return (
                <React.Fragment key={index}>
                    <button
                        disabled={!canReallyPlay}
                        id={`${card.name.replace(/\s+/g, '-')}-opt-${index}`}
                        onClick={() => handlePlayCardAction(option, card)}
                    >
                        {options.length === 1 ? 'Play Action' : option.text}
                    </button>
                    {!canPlay && reason ? (
                        <CardText>
                            <em>{reason}</em>
                        </CardText>
                    ) : null}
                    {option.cost && actionPendingPayment && (
                        <PaymentPopover
                            isOpen={!!actionPendingPayment}
                            target={`${card.name.replace(/\s+/g, '-')}-opt-${index}`}
                            cost={option.cost}
                            toggle={() => setActionPendingPayment(null)}
                            onConfirmPayment={(payment: PropertyCounter<Resource>) =>
                                handleConfirmActionPayment(payment, card)
                            }
                        />
                    )}
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

    const sortedPlayers = [...players].sort(
        (a, b) =>
            state.common.playingPlayers.indexOf(a.index) -
            state.common.playingPlayers.indexOf(b.index)
    );

    const playerMakingDecision =
        player.pendingTilePlacement ||
        state.common.revealedCards.length > 0 ||
        player.possibleCards.length > 0 ||
        player.pendingResourceActionDetails ||
        player.pendingDiscard;

    useEffect(() => {
        if (!playerMakingDecision) {
            context.processQueue(dispatch);
        }
    }, []);
    return (
        <>
            <GlobalStyle />
            <ActionBar>
                <ActionBarRow>
                    <Flex width="100%" justifyContent="space-between">
                        <Info>
                            Playing as {player.corporation?.name}. {!action && 'You have passed'}
                            {action ? waitingMessage || `Action ${action} of 2` : null}
                            {action && !(context.shouldDisableUI(state) || playerMakingDecision) ? (
                                <ActionBarButton onClick={() => dispatch(skipAction(playerIndex))}>
                                    {action === 2 ? 'Skip 2nd action' : 'Pass'}
                                </ActionBarButton>
                            ) : null}
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
                    <Panel>
                        <Box margin="8px" fontWeight="bold">
                            <em>Log</em>
                        </Box>
                        <Flex
                            maxHeight="400px"
                            margin="12px"
                            overflowY="auto"
                            flexDirection="column-reverse"
                        >
                            <SwitchColors>
                                {log.map((entry, entryIndex) => {
                                    return (
                                        <Box
                                            marginTop="4px"
                                            padding="8px"
                                            key={'Log-entry-' + entryIndex}
                                        >
                                            {entry}
                                        </Box>
                                    );
                                })}
                            </SwitchColors>
                        </Flex>
                    </Panel>
                </Box>

                <Box marginLeft="16px" flexGrow="1">
                    <Box>
                        <Switcher
                            defaultTabIndex={sortedPlayers.indexOf(player)}
                            tabs={sortedPlayers.map(player => (
                                <Flex flexDirection="row" alignItems="center">
                                    <Box display="inline-block" marginRight="8px">
                                        {player.corporation?.name}
                                    </Box>
                                    <Square playerIndex={player.index} />
                                </Flex>
                            ))}
                        >
                            {sortedPlayers.map(thisPlayer => {
                                const cards = (
                                    <Hand key={thisPlayer.index + 'hand'}>
                                        {thisPlayer.cards.map(card => {
                                            const [canPlay, reason] = context.canPlayCard(
                                                card,
                                                state
                                            );
                                            return (
                                                <CardComponent
                                                    key={card.name}
                                                    content={card}
                                                    isHidden={thisPlayer.index !== playerIndex}
                                                    width={250}
                                                    onClick={(e: MouseEvent<HTMLDivElement>) => {
                                                        if (playerIndex !== thisPlayer.index)
                                                            return;
                                                        handleCardClick(card);
                                                    }}
                                                    selected={cardsToDiscard.includes(card)}
                                                >
                                                    {!canPlay && (
                                                        <CardText>
                                                            <em>{reason}</em>
                                                        </CardText>
                                                    )}
                                                    {playerIndex === thisPlayer.index ? (
                                                        <button
                                                            disabled={
                                                                !canPlay || player.pendingDiscard
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
                                            <PaymentPopover
                                                isOpen={isPaymentPopoverOpen}
                                                target={cardPendingPayment.name.replace(
                                                    /\s+/g,
                                                    '-'
                                                )}
                                                card={cardPendingPayment}
                                                toggle={() =>
                                                    setIsPaymentPopoverOpen(!isPaymentPopoverOpen)
                                                }
                                                onConfirmPayment={(...args) =>
                                                    handleConfirmCardPayment(...args)
                                                }
                                            />
                                        )}
                                    </Hand>
                                );
                                const playedCards = (
                                    <Hand key={thisPlayer.index + 'playedCards'}>
                                        {thisPlayer.playedCards.map(card => {
                                            let resources = '';
                                            const {
                                                storedResourceType: type,
                                                storedResourceAmount: amount,
                                            } = card;
                                            if (type) {
                                                resources = `Holds ${amount} ${getResourceName(
                                                    type
                                                )}${amount === 1 ? '' : 's'}`;
                                            }
                                            return (
                                                <CardComponent
                                                    content={card}
                                                    width={250}
                                                    key={card.name}
                                                    isHidden={
                                                        thisPlayer.index !== playerIndex &&
                                                        card.type === CardType.EVENT
                                                    }
                                                >
                                                    {resources && <CardText>{resources}</CardText>}

                                                    {cardActionElements(thisPlayer, card)}
                                                </CardComponent>
                                            );
                                        })}
                                    </Hand>
                                );

                                return (
                                    <React.Fragment key={thisPlayer.index}>
                                        <Panel>
                                            <PlayerOverview
                                                player={thisPlayer}
                                                isLoggedInPlayer={playerIndex === thisPlayer.index}
                                            />
                                        </Panel>
                                        <Panel>
                                            <Switcher
                                                color={colors[thisPlayer.index]}
                                                tabs={['Hand', 'Played Cards']}
                                                defaultTabIndex={getDefaultTabIndex(thisPlayer)}
                                            >
                                                {[cards, playedCards]}
                                            </Switcher>
                                        </Panel>
                                    </React.Fragment>
                                );
                            })}
                        </Switcher>
                    </Box>
                </Box>
            </Flex>
            {playerMakingDecision && (
                <ActionBar className="bottom">
                    <ActionBarRow>
                        {player.pendingDiscard && (
                            <>
                                <div>
                                    Please select{' '}
                                    {getCardDiscardAmountHumanName(player.pendingDiscard)} card
                                    {player.pendingDiscard === 1 ? '' : 's'} to discard.
                                </div>
                                <Button
                                    disabled={cardsToDiscard.length < minCardsToDiscard}
                                    onClick={confirmDiscardSelection}
                                >
                                    Confirm discard selection
                                </Button>
                            </>
                        )}
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
                                    {player.buyCards
                                        ? 'Confirm'
                                        : `Take ${player.numCardsToTake === 1 ? 'card' : 'cards'}`}
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
