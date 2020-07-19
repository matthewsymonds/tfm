import {
    announceReadyToStartRound,
    completeAction,
    discardCards,
    discardRevealedCards,
    moveCardFromHandToPlayArea,
    payForCards,
    removeForcedActionFromPlayer,
    setCards,
    setSelectedCards,
} from 'actions';
import AskUserToConfirmResourceActionDetails from 'components/ask-user-to-confirm-resource-action-details';
import PaymentPopover from 'components/popovers/payment-popover';
import {Switcher} from 'components/switcher';
import {TileType} from 'constants/board';
import {CardType} from 'constants/card-types';
import {colors, GameStage} from 'constants/game';
import {PropertyCounter} from 'constants/property-counter';
import {getResourceName, Resource} from 'constants/resource';
import {VariableAmount} from 'constants/variable-amount';
import {AppContext, doesCardPaymentRequirePlayerInput} from 'context/app-context';
import {useSyncState} from 'hooks/sync-state';
import {Card} from 'models/card';
import React, {MouseEvent, useContext, useEffect, useState} from 'react';
import {useDispatch, useStore} from 'react-redux';
import {RootState, useTypedSelector} from 'reducer';
import {getHumanReadableTileName, aAnOrThe} from 'selectors/get-human-readable-tile-name';
import {getForcedActionsForPlayer} from 'selectors/player';
import styled from 'styled-components';
import {ActionBar, ActionBarRow} from './action-bar';
import {AskUserToMakeActionChoice} from './ask-user-to-make-action-choice';
import Awards from './board/awards';
import {Board} from './board/board';
import Milestones from './board/milestones';
import StandardProjects from './board/standard-projects';
import {Box, Flex, Panel} from './box';
import {Button} from './button';
import {CardActionElements, CardComponent, CardDisabledText, CardText} from './card';
import {CardSelector} from './card-selector';
import GlobalParams from './global-params';
import {PlayerOverview} from './player-overview';
import {Square} from './square';
import {SwitchColors} from './switch-colors';
import {TopBar} from 'components/top-bar';

const Hand = styled.div`
    display: flex;
    align-items: stretch;
    justify-content: flex-start;
    width: 100%;
    overflow-y: auto;
    flex-wrap: wrap;
`;

const ActiveRoundOuter = styled.div`
    width: calc(100% - 32px);
    margin: 16px;
    display: flex;
`;

const RightBox = styled.div`
    width: 100%;
    flex-grow: 1;
`;

const HiddenCardsMessage = styled.div`
    margin: 16px;
`;

const PromptTitle = styled.h3`
    margin-top: 16px;
`;

export const ActiveRound = ({loggedInPlayerIndex}: {loggedInPlayerIndex: number}) => {
    const loggedInPlayer = useTypedSelector(state => state.players[loggedInPlayerIndex]);
    const {corporation, possibleCards, cards, selectedCards} = loggedInPlayer;
    const store = useStore<RootState>();
    const state = store.getState();
    const dispatch = useDispatch();
    const context = useContext(AppContext);
    const log = useTypedSelector(state => state.log);

    const [isPaymentPopoverOpen, setIsPaymentPopoverOpen] = useState(false);
    const [cardPendingPayment, setCardPendingPayment] = useState<Card | null>(null);

    let maxCardsToDiscard: number;
    const discardAmount = loggedInPlayer?.pendingDiscard?.amount;

    if (discardAmount === VariableAmount.USER_CHOICE) {
        maxCardsToDiscard = cards.length;
    } else if (discardAmount === VariableAmount.USER_CHOICE_UP_TO_ONE) {
        maxCardsToDiscard = 1;
    } else {
        maxCardsToDiscard = discardAmount as number;
    }

    let minCardsToDiscard = 0;
    if (typeof discardAmount === 'number') {
        minCardsToDiscard = discardAmount;
    }
    if (discardAmount === VariableAmount.USER_CHOICE) {
        // Can't cycle a turn with sell patents by selling 0 cards!
        minCardsToDiscard = 1;
    }

    useSyncState();

    const gameStage = useTypedSelector(state => state?.common?.gameStage);
    const currentPlayerIndex = useTypedSelector(state => state.common.currentPlayerIndex);

    useEffect(() => {
        if (gameStage !== GameStage.ACTIVE_ROUND) {
            return;
        }
        if (currentPlayerIndex !== loggedInPlayerIndex) {
            return;
        }
        const forcedActions = getForcedActionsForPlayer(state, loggedInPlayer.index);

        for (let i = 0; i < 2; i++) {
            if (forcedActions[i]) {
                context.playAction({state, action: forcedActions[i]});
                context.queue.push(completeAction(loggedInPlayer.index));
                context.queue.push(
                    removeForcedActionFromPlayer(loggedInPlayerIndex, forcedActions[i])
                );
            }
        }
        if (forcedActions.length > 0) {
            context.processQueue(dispatch);
        }
    }, [gameStage, currentPlayerIndex]);

    function playCard(card: Card, payment?: PropertyCounter<Resource>) {
        dispatch(moveCardFromHandToPlayArea(card, loggedInPlayerIndex));
        context.playCard(card, store.getState(), payment);
        // Have to trigger effects from the card we just played.
        // Must be processed separatedly in case the card affects itself.
        context.triggerEffectsFromPlayedCard(
            card,
            // refreshed state so that the card we just played is present.
            store.getState()
        );
        context.processQueue(dispatch);
    }

    function handlePlayCard(card: Card) {
        if (doesCardPaymentRequirePlayerInput(loggedInPlayer, card)) {
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

    const players = useTypedSelector(state => state.players);

    function continueAfterRevealingCards() {
        context.queue.push(discardRevealedCards());
        context.processQueue(dispatch);
    }

    // Used for buying, taking, and discarding cards
    function handleConfirmCardSelection() {
        if (gameStage === GameStage.ACTIVE_ROUND) {
            // buying & taking cards already pre-dispatch the requisite next steps.
            // for discarding, though, we need to explicitly dispatch the next step here.
            if (loggedInPlayer.pendingDiscard) {
                dispatch(discardCards(selectedCards, loggedInPlayerIndex));
            }
            context.processQueue(dispatch);
            return;
        }

        if (gameStage === GameStage.CORPORATION_SELECTION) {
            dispatch(moveCardFromHandToPlayArea(corporation, loggedInPlayerIndex));
            context.playCard(corporation, state);
            context.triggerEffectsFromPlayedCard(corporation, store.getState());
        }

        dispatch(setCards(cards.concat(selectedCards), loggedInPlayerIndex));
        dispatch(setSelectedCards([], loggedInPlayerIndex));
        dispatch(
            discardCards(
                possibleCards.filter(card => !selectedCards.includes(card)),
                loggedInPlayerIndex
            )
        );
        dispatch(payForCards(selectedCards, loggedInPlayerIndex));
        dispatch(announceReadyToStartRound(loggedInPlayerIndex));
        context.processQueue(dispatch);
    }

    const totalCardCost = loggedInPlayer.selectedCards.length * 3;
    const playerMoney =
        gameStage === GameStage.CORPORATION_SELECTION
            ? loggedInPlayer.corporation.gainResource[Resource.MEGACREDIT]
            : loggedInPlayer.resources[Resource.MEGACREDIT];

    const isCorporationSelection = gameStage === GameStage.CORPORATION_SELECTION;
    const isBuyOrDiscard = gameStage === GameStage.BUY_OR_DISCARD;
    const remainingMegacreditsToBuyCards =
        loggedInPlayer.buyCards || isBuyOrDiscard ? playerMoney - totalCardCost : playerMoney;

    let cardSelectionPrompt;
    let cardSelectionButtonText;
    const numSelectedCards = loggedInPlayer.selectedCards.length;
    const cardOrCards = `card${numSelectedCards === 1 ? '' : 's'}`;

    if (loggedInPlayer.buyCards || isBuyOrDiscard) {
        // buying cards, e.g. between generations
        const numCards = loggedInPlayer.possibleCards.length;
        cardSelectionPrompt = `Select up to ${numCards} card${
            numCards === 1 ? '' : 's'
        } to buy (${remainingMegacreditsToBuyCards} MC remaining)`;

        cardSelectionButtonText = `Buy ${numSelectedCards} ${cardOrCards}`;
    } else if (loggedInPlayer.numCardsToTake) {
        // taking cards, e.g. invention contest (look at 4, take 2)
        const numCards = loggedInPlayer.numCardsToTake;
        cardSelectionPrompt = `Select ${numCards} card${numCards === 1 ? '' : 's'} to take`;
        cardSelectionButtonText = `Take ${numSelectedCards} ${cardOrCards}`;
    } else if (loggedInPlayer.pendingDiscard) {
        cardSelectionButtonText = `Discard ${numSelectedCards} ${cardOrCards}`;
        switch (loggedInPlayer.pendingDiscard.amount) {
            case VariableAmount.USER_CHOICE:
                cardSelectionPrompt = 'Select 1 or more cards to discard';
                break;
            case VariableAmount.USER_CHOICE_UP_TO_ONE:
                cardSelectionPrompt = 'You may discard up to one card';
                break;
            default:
                throw new Error('Unhandled pending discard scenario');
        }
    }

    const shouldDisableDiscardConfirmation =
        loggedInPlayer.pendingDiscard?.amount === VariableAmount.USER_CHOICE &&
        selectedCards.length === 0;
    const shouldDisableConfirmCardSelection =
        shouldDisableDiscardConfirmation ||
        totalCardCost > playerMoney ||
        (loggedInPlayer.numCardsToTake !== null &&
            loggedInPlayer.selectedCards.length < loggedInPlayer.numCardsToTake);

    const sortedPlayers = [...players].sort(
        (a, b) =>
            state.common.playerIndexOrderForGeneration.indexOf(a.index) -
            state.common.playerIndexOrderForGeneration.indexOf(b.index)
    );

    const isPlayerMakingDecision =
        loggedInPlayer.pendingTilePlacement ||
        state.common.revealedCards.length > 0 ||
        loggedInPlayer.possibleCards.length > 0 ||
        loggedInPlayer.forcedActions.length > 0 ||
        loggedInPlayer.pendingResourceActionDetails ||
        loggedInPlayer.pendingChoice ||
        loggedInPlayer.pendingDiscard;

    useEffect(() => {
        if (gameStage !== GameStage.ACTIVE_ROUND) {
            return;
        }
        if (currentPlayerIndex !== loggedInPlayerIndex) {
            return;
        }
        if (!isPlayerMakingDecision) {
            context.processQueue(dispatch);
        }
    }, [gameStage, currentPlayerIndex]);

    return (
        <>
            <TopBar
                loggedInPlayer={loggedInPlayer}
                isPlayerMakingDecision={isPlayerMakingDecision}
            />
            <ActiveRoundOuter className="active-round-outer">
                <Box width={'648px'}>
                    <Board
                        board={state.common.board}
                        playerIndex={loggedInPlayerIndex}
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

                <RightBox className="right-box">
                    <Box width="100%">
                        <Switcher
                            defaultTabIndex={sortedPlayers.indexOf(loggedInPlayer)}
                            tabs={sortedPlayers.map(player => (
                                <Flex flexDirection="row" alignItems="center" key={player.index}>
                                    <Box display="inline-block" marginRight="8px">
                                        {isCorporationSelection
                                            ? player.username
                                            : player.corporation.name}
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
                                            const [canPlay, reason] = context.canPlayCard(
                                                card,
                                                state
                                            );
                                            return (
                                                <CardComponent key={card.name} content={card}>
                                                    {!canPlay && (
                                                        <CardDisabledText>
                                                            <em>{reason}</em>
                                                        </CardDisabledText>
                                                    )}
                                                    {loggedInPlayerIndex === thisPlayer.index ? (
                                                        <button
                                                            disabled={
                                                                !canPlay ||
                                                                loggedInPlayer.pendingDiscard
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
                                                    resources = `Holds ${amount} ${getResourceName(
                                                        type
                                                    )}${amount === 1 ? '' : 's'}`;
                                                }

                                                const isLoggedInPlayer =
                                                    thisPlayer.index === loggedInPlayerIndex;
                                                return (
                                                    <CardComponent
                                                        content={card}
                                                        key={card.name}
                                                        isHidden={
                                                            !isLoggedInPlayer &&
                                                            card.type === CardType.EVENT
                                                        }
                                                    >
                                                        {resources && (
                                                            <CardText>{resources}</CardText>
                                                        )}

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
                                        You can't count {thisPlayer.username}'s hand until
                                        everyone's ready.
                                    </HiddenCardsMessage>
                                );

                                const cardsHiddenBuyOrDiscard = (
                                    <HiddenCardsMessage key={handKey}>
                                        {thisPlayer.corporation.name} had{' '}
                                        {thisPlayer.previousCardsInHand || 0} card
                                        {thisPlayer.previousCardsInHand === 1 ? '' : 's'} at the end
                                        of the previous round.
                                    </HiddenCardsMessage>
                                );

                                const cardsHiddenActiveRound = (
                                    <HiddenCardsMessage key={handKey}>
                                        {thisPlayer.corporation.name} has {thisPlayer.cards.length}{' '}
                                        card
                                        {thisPlayer.cards.length === 1 ? '' : 's'} in hand.
                                    </HiddenCardsMessage>
                                );

                                const noPlayedCardsMessage = (
                                    <HiddenCardsMessage key={playedCardsKey}>
                                        No cards played yet.
                                    </HiddenCardsMessage>
                                );

                                const noCardsInHandMessage = (
                                    <HiddenCardsMessage key={handKey}>
                                        No cards in hand.
                                    </HiddenCardsMessage>
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
                                                    isLoggedInPlayer={
                                                        loggedInPlayerIndex === thisPlayer.index
                                                    }
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
                    </Box>
                </RightBox>
            </ActiveRoundOuter>
            {isPlayerMakingDecision && (
                <ActionBar className="bottom">
                    <ActionBarRow>
                        {loggedInPlayer.pendingChoice && (
                            <AskUserToMakeActionChoice player={loggedInPlayer} />
                        )}
                        {loggedInPlayer.possibleCards.length > 0 && (
                            <Flex flexDirection="column">
                                <PromptTitle>{cardSelectionPrompt}</PromptTitle>
                                <CardSelector
                                    max={
                                        loggedInPlayer.numCardsToTake ||
                                        maxCardsToDiscard ||
                                        Infinity
                                    }
                                    selectedCards={loggedInPlayer.selectedCards}
                                    onSelect={cards =>
                                        dispatch(setSelectedCards(cards, loggedInPlayerIndex))
                                    }
                                    options={loggedInPlayer.possibleCards}
                                    budget={remainingMegacreditsToBuyCards}
                                    orientation="vertical"
                                />
                                <Flex justifyContent="center">
                                    <Button
                                        disabled={shouldDisableConfirmCardSelection}
                                        onClick={() => handleConfirmCardSelection()}
                                    >
                                        {cardSelectionButtonText}
                                    </Button>
                                </Flex>
                            </Flex>
                        )}
                        {loggedInPlayer.pendingTilePlacement &&
                            (loggedInPlayer.pendingTilePlacement.type === TileType.LAND_CLAIM ? (
                                <PromptTitle>Claim an unreserved area.</PromptTitle>
                            ) : (
                                <PromptTitle>
                                    Place {aAnOrThe(loggedInPlayer.pendingTilePlacement.type)}{' '}
                                    {getHumanReadableTileName(
                                        loggedInPlayer.pendingTilePlacement.type
                                    )}{' '}
                                    tile.
                                </PromptTitle>
                            ))}
                        {loggedInPlayer.pendingResourceActionDetails && (
                            <AskUserToConfirmResourceActionDetails
                                player={loggedInPlayer}
                                resourceActionDetails={loggedInPlayer.pendingResourceActionDetails}
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
