import {
    announceReadyToStartRound,
    completeAction,
    discardCards,
    discardRevealedCards,
    moveCardFromHandToPlayArea,
    payForCards,
    removeForcedActionFromPlayer,
    setCards,
} from 'actions';
import AskUserToConfirmResourceActionDetails from 'components/ask-user-to-confirm-resource-action-details';
import {LogPanel} from 'components/log-panel';
import {PlayerPanel} from 'components/player-panel';
import {Switcher} from 'components/switcher';
import {TopBar} from 'components/top-bar';
import {TileType} from 'constants/board';
import {GameStage} from 'constants/game';
import {Resource} from 'constants/resource';
import {VariableAmount} from 'constants/variable-amount';
import {AppContext} from 'context/app-context';
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

const PromptTitle = styled.h3`
    margin-top: 16px;
`;

export const ActiveRound = ({loggedInPlayerIndex}: {loggedInPlayerIndex: number}) => {
    /**
     * Hooks
     */
    const store = useStore<RootState>();
    const dispatch = useDispatch();
    const context = useContext(AppContext);
    const [selectedPlayerIndex, setSelectedPlayerIndex] = useState(loggedInPlayerIndex);
    useSyncState();
    const [selectedCards, setSelectedCards] = useState<Card[]>([]);

    const gameStage = useTypedSelector(state => state?.common?.gameStage);
    const currentPlayerIndex = useTypedSelector(state => state.common.currentPlayerIndex);
    const loggedInPlayer = useTypedSelector(state => state.players[loggedInPlayerIndex]);

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

    /**
     * Derived state
     */
    const {cards, corporation, possibleCards} = loggedInPlayer;
    const state = store.getState();

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

    const numSelectedCards = selectedCards.length;

    const totalCardCost = numSelectedCards * 3;
    const playerMoney =
        gameStage === GameStage.CORPORATION_SELECTION
            ? loggedInPlayer.corporation.gainResource[Resource.MEGACREDIT]
            : loggedInPlayer.resources[Resource.MEGACREDIT];

    const isBuyOrDiscard = gameStage === GameStage.BUY_OR_DISCARD;
    const remainingMegacreditsToBuyCards =
        loggedInPlayer.buyCards || isBuyOrDiscard ? playerMoney - totalCardCost : playerMoney;

    let cardSelectionPrompt;
    let cardSelectionButtonText;
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
        const cardOrCards = numCards === 1 ? 'card' : 'cards';
        cardSelectionPrompt = `Select ${numCards} ${cardOrCards} to take`;
        cardSelectionButtonText = `Take ${numCards} ${cardOrCards}`;
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
        numSelectedCards === 0;
    const shouldDisableConfirmCardSelection =
        shouldDisableDiscardConfirmation ||
        totalCardCost > playerMoney ||
        (loggedInPlayer.numCardsToTake !== null &&
            numSelectedCards < loggedInPlayer.numCardsToTake);

    const isPlayerMakingDecision =
        loggedInPlayer.pendingTilePlacement ||
        state.common.revealedCards.length > 0 ||
        loggedInPlayer.possibleCards.length > 0 ||
        loggedInPlayer.forcedActions.length > 0 ||
        loggedInPlayer.pendingResourceActionDetails ||
        loggedInPlayer.pendingChoice ||
        loggedInPlayer.pendingDuplicateProduction ||
        loggedInPlayer.pendingDiscard;

    /**
     * Event handlers
     */
    function continueAfterRevealingCards() {
        context.queue.push(discardRevealedCards());
        context.processQueue(dispatch);
    }
    // Used for buying, taking, and discarding cards
    function handleConfirmCardSelection() {
        setSelectedCards([]);
        if (loggedInPlayer.pendingDiscard) {
            dispatch(discardCards(selectedCards, loggedInPlayerIndex));
            context.processQueue(dispatch);
            return;
        }
        if (gameStage === GameStage.CORPORATION_SELECTION) {
            dispatch(moveCardFromHandToPlayArea(corporation, loggedInPlayerIndex));
            context.playCard(corporation, state);
            context.triggerEffectsFromPlayedCard(corporation, store.getState());
        }

        if (loggedInPlayer.buyCards) {
            dispatch(payForCards(selectedCards, loggedInPlayerIndex));
        }

        dispatch(setCards(cards.concat(selectedCards), loggedInPlayerIndex));
        dispatch(
            discardCards(
                possibleCards.filter(card => !selectedCards.includes(card)),
                loggedInPlayerIndex
            )
        );
        if (gameStage !== GameStage.ACTIVE_ROUND) {
            dispatch(announceReadyToStartRound(loggedInPlayerIndex));
        }
        context.processQueue(dispatch);
    }

    return (
        <Flex flexDirection="column" position="absolute" left="0" right="0" bottom="0" top="0">
            <Flex flex="none" border>
                <TopBar
                    isPlayerMakingDecision={isPlayerMakingDecision}
                    selectedPlayerIndex={selectedPlayerIndex}
                    setSelectedPlayerIndex={setSelectedPlayerIndex}
                />
            </Flex>
            <Flex className="active-round-outer" padding="16px" flex="auto">
                <Pane
                    className="active-round-left"
                    display="flex"
                    flexDirection="column"
                    flex="auto"
                    marginRight="4px"
                >
                    <PlayerPanel selectedPlayerIndex={selectedPlayerIndex} />
                    <LogPanel />
                </Pane>

                <Pane
                    className="active-round-right"
                    display="flex"
                    flexDirection="column"
                    marginLeft="4px"
                >
                    <Panel>
                        <Board />
                    </Panel>
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
            </Flex>
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
                                    min={
                                        loggedInPlayer.buyCards ? 0 : loggedInPlayer.numCardsToTake
                                    }
                                    selectedCards={selectedCards}
                                    onSelect={cards => setSelectedCards(cards)}
                                    options={loggedInPlayer.possibleCards}
                                    budget={
                                        loggedInPlayer.buyCards
                                            ? remainingMegacreditsToBuyCards
                                            : Infinity
                                    }
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
        </Flex>
    );
};
