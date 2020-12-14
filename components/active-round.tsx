import {ApiClient} from 'api-client';
import {ActionGuard} from 'client-server-shared/action-guard';
import AskUserToConfirmResourceActionDetails from 'components/ask-user-to-confirm-resource-action-details';
import {LogPanel} from 'components/log-panel';
import {PlayerHand} from 'components/player-hand';
import {PlayerPanel} from 'components/player-panel';
import {TopBar} from 'components/top-bar';
import {TileType} from 'constants/board';
import {GameStage} from 'constants/game';
import {VariableAmount} from 'constants/variable-amount';
import {Card} from 'models/card';
import React, {useState} from 'react';
import {useDispatch} from 'react-redux';
import {useTypedSelector} from 'reducer';
import {aAnOrThe, getHumanReadableTileName} from 'selectors/get-human-readable-tile-name';
import {getIsPlayerMakingDecision} from 'selectors/get-is-player-making-decision';
import {getMoney} from 'selectors/get-money';
import styled from 'styled-components';
import {ActionBar, ActionBarRow} from './action-bar';
import {AskUserToDuplicateProduction} from './ask-user-to-confirm-duplicate-production';
import {AskUserToMakeActionChoice} from './ask-user-to-make-action-choice';
import Awards from './board/awards';
import {Board} from './board/board';
import Milestones from './board/milestones';
import StandardProjects from './board/standard-projects';
import {Box, Flex, PanelWithTabs} from './box';
import {CardComponent} from './card';
import {CardSelector} from './card-selector';

const PromptTitle = styled.h3`
    margin-top: 16px;
`;

export const ActiveRound = ({loggedInPlayerIndex}: {loggedInPlayerIndex: number}) => {
    /**
     * Hooks
     */
    const dispatch = useDispatch();
    const [selectedPlayerIndex, setSelectedPlayerIndex] = useState(loggedInPlayerIndex);
    const actionSets = ['Standard Projects', 'Milestones', 'Awards'];
    const [selectedActionSetIndex, setSelectedActionSetIndex] = useState(0);
    const [selectedCards, setSelectedCards] = useState<Card[]>([]);

    const gameStage = useTypedSelector(state => state?.common?.gameStage);
    const currentPlayerIndex = useTypedSelector(state => state.common.currentPlayerIndex);
    const loggedInPlayer = useTypedSelector(state => state.players[loggedInPlayerIndex]);

    /**
     * Derived state
     */
    const {cards, corporation, possibleCards} = loggedInPlayer;
    const state = useTypedSelector(state => state);

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
    const playerMoney = getMoney(state, loggedInPlayer, corporation);

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

    const actionGuard = new ActionGuard(state, loggedInPlayer.username);

    const shouldDisableConfirmCardSelection = !actionGuard.canConfirmCardSelection(
        numSelectedCards,
        state,
        corporation
    );

    const isPlayerMakingDecision = getIsPlayerMakingDecision(state, loggedInPlayer);

    const apiClient = new ApiClient(dispatch);

    /**
     * Event handlers
     */
    async function continueAfterRevealingCards() {
        await apiClient.continueAfterRevealingCardsAsync();
    }
    // Used for buying, taking, and discarding cards
    async function handleConfirmCardSelection() {
        await apiClient.confirmCardSelectionAsync({selectedCards, corporation});
        setSelectedCards([]);
    }

    function renderSelectedActionSet() {
        const selectedActionSet = actionSets[selectedActionSetIndex];
        if (selectedActionSet === 'Milestones') {
            return <Milestones />;
        } else if (selectedActionSet === 'Awards') {
            return <Awards />;
        } else if (selectedActionSet === 'Standard Projects') {
            return <StandardProjects />;
        } else {
            throw new Error('Unrecognized action set');
        }
    }

    return (
        <React.Fragment>
            <Flex flexDirection="column">
                {isPlayerMakingDecision && (
                    <ActionBar>
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
                                            loggedInPlayer.buyCards
                                                ? 0
                                                : loggedInPlayer.numCardsToTake || 0
                                        }
                                        selectedCards={selectedCards}
                                        onSelect={cards => setSelectedCards(cards)}
                                        options={loggedInPlayer.possibleCards}
                                        budget={
                                            loggedInPlayer.buyCards
                                                ? remainingMegacreditsToBuyCards
                                                : undefined
                                        }
                                        orientation="vertical"
                                    />
                                    <Flex justifyContent="center">
                                        <button
                                            disabled={shouldDisableConfirmCardSelection}
                                            onClick={() => handleConfirmCardSelection()}
                                        >
                                            {cardSelectionButtonText}
                                        </button>
                                    </Flex>
                                </Flex>
                            )}
                            {loggedInPlayer.pendingTilePlacement &&
                                (loggedInPlayer.pendingTilePlacement.type ===
                                TileType.LAND_CLAIM ? (
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
                                    resourceActionDetails={
                                        loggedInPlayer.pendingResourceActionDetails
                                    }
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
                <Flex flex="none">
                    <TopBar isPlayerMakingDecision={isPlayerMakingDecision} />
                </Flex>
                <Flex className="active-round-outer" padding="16px" flex="auto" overflow="auto">
                    <Flex
                        className="active-round-left"
                        flexDirection="column"
                        flex="auto"
                        marginRight="4px"
                    >
                        <PlayerPanel
                            selectedPlayerIndex={selectedPlayerIndex}
                            setSelectedPlayerIndex={setSelectedPlayerIndex}
                        />
                    </Flex>

                    <Flex className="active-round-middle" flexDirection="column" marginRight="4px">
                        <Board />
                    </Flex>

                    <Flex className="active-round-right" flexDirection="column" marginLeft="4px">
                        <Box marginTop="8px">
                            <PanelWithTabs
                                setSelectedTabIndex={setSelectedActionSetIndex}
                                selectedTabIndex={selectedActionSetIndex}
                                tabs={actionSets}
                                tabType="action-set"
                            >
                                {renderSelectedActionSet()}
                            </PanelWithTabs>
                            <LogPanel />
                        </Box>
                    </Flex>
                </Flex>
            </Flex>
            <PlayerHand player={loggedInPlayer} />
        </React.Fragment>
    );
};
