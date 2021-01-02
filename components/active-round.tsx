import AskUserToConfirmResourceActionDetails from 'components/ask-user-to-confirm-resource-action-details';
import {AskUserToMakeCardSelection} from 'components/ask-user-to-make-card-selection';
import {AskUserToMakeDiscardChoice} from 'components/ask-user-to-make-discard-choice';
import {Card as CardComponent} from 'components/card/Card';
import {PlayerHand} from 'components/player-hand';
import {TopBar} from 'components/top-bar';
import {TileType} from 'constants/board';
import {GameStage} from 'constants/game';
import {useApiClient} from 'hooks/use-api-client';
import React, {useState} from 'react';
import {useTypedSelector} from 'reducer';
import {getCard} from 'selectors/get-card';
import {aAnOrThe, getHumanReadableTileName} from 'selectors/get-human-readable-tile-name';
import {getIsPlayerMakingDecision} from 'selectors/get-is-player-making-decision';
import styled from 'styled-components';
import {ActionBar, ActionBarRow} from './action-bar';
import {AskUserToDuplicateProduction} from './ask-user-to-confirm-duplicate-production';
import {AskUserToMakeActionChoice} from './ask-user-to-make-action-choice';
import {Board} from './board/board';
import {Flex} from './box';
import {EndOfGame} from './end-of-game';
import PlayerPanel from 'components/player-panel-new';

const PromptTitle = styled.h3`
    margin-top: 16px;
`;

export const ActiveRound = ({loggedInPlayerIndex}: {loggedInPlayerIndex: number}) => {
    /**
     * Hooks
     */
    const [selectedPlayerIndex, setSelectedPlayerIndex] = useState(loggedInPlayerIndex);

    const loggedInPlayer = useTypedSelector(state => state.players[loggedInPlayerIndex]);

    /**
     * Derived state
     */
    const isPlayerMakingDecision = useTypedSelector(state =>
        getIsPlayerMakingDecision(state, loggedInPlayer)
    );
    const revealedCards = useTypedSelector(state => state.common.revealedCards);
    const apiClient = useApiClient();

    /**
     * Event handlers
     */
    async function continueAfterRevealingCards() {
        await apiClient.continueAfterRevealingCardsAsync();
    }

    const gameStage = useTypedSelector(state => state.common.gameStage);

    return (
        <React.Fragment>
            <Flex flexDirection="column">
                {isPlayerMakingDecision && (
                    <ActionBar>
                        <ActionBarRow>
                            {gameStage === GameStage.END_OF_GAME && <EndOfGame />}
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
                            {revealedCards.length > 0 && (
                                <Flex flexDirection="column">
                                    <p>
                                        Card{revealedCards.length > 1 ? 's' : ''} revealed &
                                        discarded:
                                    </p>
                                    <Flex>
                                        {revealedCards.map((card, index) => {
                                            return (
                                                <CardComponent key={index} card={getCard(card)} />
                                            );
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
                <Flex
                    className="active-round-outer"
                    padding="16px"
                    flex="auto"
                    overflow="auto"
                    alignItems="stretch"
                >
                    <Flex
                        className="active-round-left"
                        flexDirection="column"
                        flex="auto"
                        marginRight="4px"
                    >
                        {state.players.map(player => (
                            <PlayerPanel player={player} />
                        ))}
                    </Flex>

                    <Flex className="active-round-right" flexDirection="column" marginRight="4px">
                        <Board />
                    </Flex>
                </Flex>
            </Flex>
            <PlayerHand player={loggedInPlayer} />
        </React.Fragment>
    );
};
