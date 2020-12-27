import {ApiClient} from 'api-client';
import AskUserToConfirmResourceActionDetails from 'components/ask-user-to-confirm-resource-action-details';
import {AskUserToMakeCardSelection} from 'components/ask-user-to-make-card-selection';
import {AskUserToMakeDiscardChoice} from 'components/ask-user-to-make-discard-choice';
import {Card as CardComponent} from 'components/card/Card';
import {LogPanel} from 'components/log-panel';
import {PlayerHand} from 'components/player-hand';
import {PlayerPanel} from 'components/player-panel';
import {TopBar} from 'components/top-bar';
import {TileType} from 'constants/board';
import React, {useState} from 'react';
import {useDispatch} from 'react-redux';
import {useTypedSelector} from 'reducer';
import {aAnOrThe, getHumanReadableTileName} from 'selectors/get-human-readable-tile-name';
import {getIsPlayerMakingDecision} from 'selectors/get-is-player-making-decision';
import styled from 'styled-components';
import {ActionBar, ActionBarRow} from './action-bar';
import {AskUserToDuplicateProduction} from './ask-user-to-confirm-duplicate-production';
import {AskUserToMakeActionChoice} from './ask-user-to-make-action-choice';
import Awards from './board/awards';
import {Board} from './board/board';
import Milestones from './board/milestones';
import StandardProjects from './board/standard-projects';
import {Box, Flex, PanelWithTabs} from './box';

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

    const loggedInPlayer = useTypedSelector(state => state.players[loggedInPlayerIndex]);

    /**
     * Derived state
     */
    const state = useTypedSelector(state => state);
    const isPlayerMakingDecision = getIsPlayerMakingDecision(state, loggedInPlayer);
    const apiClient = new ApiClient(dispatch);

    /**
     * Event handlers
     */
    async function continueAfterRevealingCards() {
        await apiClient.continueAfterRevealingCardsAsync();
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
                            {loggedInPlayer.pendingDiscard && (
                                <AskUserToMakeDiscardChoice player={loggedInPlayer} />
                            )}
                            {loggedInPlayer.pendingCardSelection && (
                                <AskUserToMakeCardSelection player={loggedInPlayer} />
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
                            {state.common.revealedCards.length > 0 && (
                                <Flex flexDirection="column">
                                    <p>
                                        Card{state.common.revealedCards.length > 1 ? 's' : ''}{' '}
                                        revealed & discarded:
                                    </p>
                                    <Flex>
                                        {state.common.revealedCards.map((card, index) => {
                                            return <CardComponent key={index} card={card} />;
                                        })}
                                    </Flex>
                                    <button
                                        style={{margin: '8px 0'}}
                                        onClick={continueAfterRevealingCards}
                                    >
                                        Continue
                                    </button>
                                </Flex>
                            )}
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
