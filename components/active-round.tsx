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
import {PlayerPanel} from 'components/active-round/player-panel';
import AskUserToConfirmResourceActionDetails from 'components/ask-user-to-confirm-resource-action-details';
import {Switcher} from 'components/switcher';
import {TopBar} from 'components/top-bar';
import {TileType} from 'constants/board';
import {GameStage} from 'constants/game';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource';
import {VariableAmount} from 'constants/variable-amount';
import {AppContext, doesCardPaymentRequirePlayerInput} from 'context/app-context';
import {Pane} from 'evergreen-ui';
import {useSyncState} from 'hooks/sync-state';
import {Card} from 'models/card';
import React, {useContext, useEffect, useState} from 'react';
import {useDispatch, useStore} from 'react-redux';
import {RootState, useTypedSelector} from 'reducer';
import {aAnOrThe, getHumanReadableTileName} from 'selectors/get-human-readable-tile-name';
import {getForcedActionsForPlayer} from 'selectors/player';
import styled from 'styled-components';
import {ActionBar, ActionBarRow} from './action-bar';
import {AskUserToDuplicateProduction} from './ask-user-to-confirm-duplicate-production';
import {AskUserToMakeActionChoice} from './ask-user-to-make-action-choice';
import Awards from './board/awards';
import {Board} from './board/board';
import Milestones from './board/milestones';
import StandardProjects from './board/standard-projects';
import {Box, Flex, Panel} from './box';
import {Button} from './button';
import {CardComponent} from './card';
import {CardSelector} from './card-selector';
import GlobalParams from './global-params';
import {SwitchColors} from './switch-colors';

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

    const isPlayerMakingDecision =
        loggedInPlayer.pendingTilePlacement ||
        state.common.revealedCards.length > 0 ||
        loggedInPlayer.possibleCards.length > 0 ||
        loggedInPlayer.forcedActions.length > 0 ||
        loggedInPlayer.pendingResourceActionDetails ||
        loggedInPlayer.pendingChoice ||
        loggedInPlayer.pendingDuplicateProduction ||
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
            <Pane className="active-round-outer" display="flex" margin="16px">
                <Pane className="active-round-left" display="flex" flexDirection="column">
                    <PlayerPanel loggedInPlayerIndex={loggedInPlayerIndex} />
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
                </Pane>

                <Pane className="active-round-right" display="flex" flexDirection="column">
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
                </Pane>
            </Pane>
            {isPlayerMakingDecision && (
                <ActionBar className="bottom">
                    <ActionBarRow>
                        {loggedInPlayer.pendingChoice && (
                            <AskUserToMakeActionChoice player={loggedInPlayer} />
                        )}
                        {loggedInPlayer.pendingDuplicateProduction && (
                            <AskUserToDuplicateProduction player={loggedInPlayer} />
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
