import AskUserToConfirmResourceActionDetails from 'components/ask-user-to-confirm-resource-action-details';
import {AskUserToMakeCardSelection} from 'components/ask-user-to-make-card-selection';
import {AskUserToMakeDiscardChoice} from 'components/ask-user-to-make-discard-choice';
import {Card as CardComponent} from 'components/card/Card';
import {PlayerIcon} from 'components/icons/player';
import {PlayerHand} from 'components/player-hand';
import PlayerPanel from 'components/player-panel';
import {ScorePopover} from 'components/popovers/score-popover';
import {PlayerResourceBoard} from 'components/resource';
import {TopBar} from 'components/top-bar';
import {colors} from 'components/ui';
import {TileType} from 'constants/board';
import {CardType} from 'constants/card-types';
import {GameStage, PLAYER_COLORS} from 'constants/game';
import {useApiClient} from 'hooks/use-api-client';
import React, {useState} from 'react';
import {useTypedSelector} from 'reducer';
import {getCard} from 'selectors/get-card';
import {aAnOrThe, getHumanReadableTileName} from 'selectors/get-human-readable-tile-name';
import {getIsPlayerMakingDecision} from 'selectors/get-is-player-making-decision';
import styled from 'styled-components';
import {useIsomorphicLayoutEffect} from './action-log';
import {ActionOverlay, ActionOverlayTopBar} from './action-overlay';
import {AskUserToDuplicateProduction} from './ask-user-to-confirm-duplicate-production';
import {AskUserToFundAward} from './ask-user-to-fund-award';
import {AskUserToIncreaseLowestProduction} from './ask-user-to-increase-lowest-production';
import {AskUserToMakeActionChoice} from './ask-user-to-make-action-choice';
import {AskUserToPlayCardFromHand} from './ask-user-to-play-card-from-hand';
import {AskUserToPlayPrelude} from './ask-user-to-play-prelude';
import {AskUserToUseBlueCardActionAlreadyUsedThisGeneration} from './ask-user-to-use-blue-card-action-already-used-this-generation';
import {Board} from './board/board';
import {Box, Flex} from './box';
import {Colonies} from './colonies';
import {EndOfGame} from './end-of-game';

const PromptTitle = styled.h3`
    margin-top: 16px;
`;

const CorporationHeader = styled.h2`
    display: inline-flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
    color: #fff;
    cursor: pointer;
    margin-bottom: 4px;
    margin-top: 0px;
`;

const CorporationHeaderOuter = styled.div<{selected: boolean}>`
    display: inline-block;
    position: relative;
    margin-left: 16px;
    margin-right: 16px;
    margin-top: 12px;
    margin-bottom: 12px;
    padding: 8px;
    background: ${props => (props.selected ? 'hsla(0, 0%, 100%, 0.2)' : 'transparent')};
`;

const TerraformRating = styled.span`
    display: inline-flex;
    cursor: pointer;
    color: ${colors.GOLD};
    margin-left: 4px;
    &:hover {
        opacity: 0.75;
        border: none;
        background: none !important;
    }
    &:active {
        opacity: 1;
    }
`;

const FirstPlayerToken = styled.div`
    position: absolute;
    display: flex;
    font-family: 'Open Sans', sans-serif;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.9em;
    color: #292929;
    border-radius: 100%;
    border: 1px solid #545454;
    width: 20px;
    height: 20px;
    top: -10px;
    right: -10px;
    background-color: ${colors.LIGHT_ORANGE};
`;

function getFontSizeForCorporation(string) {
    if (string.length > 24) {
        return '0.65em';
    } else if (string.length > 20) {
        return '0.7em';
    } else if (string.length > 15) {
        return '0.8em';
    } else if (string.length > 10) {
        return '0.85em';
    } else {
        return '0.9em';
    }
}

export const ActiveRound = ({loggedInPlayerIndex}: {loggedInPlayerIndex: number}) => {
    /**
     * Hooks
     */
    const players = useTypedSelector(state => state.players);
    const loggedInPlayer = players[loggedInPlayerIndex];
    const currentPlayerIndex = useTypedSelector(state => state.common.currentPlayerIndex);
    const firstPlayerIndex = useTypedSelector(state => state.common.firstPlayerIndex);

    const isCorporationSelection = useTypedSelector(
        state => state.common.gameStage === GameStage.CORPORATION_SELECTION
    );

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
    const [selectedPlayerIndex, setSelectedPlayerIndex] = useState(loggedInPlayer.index);
    const hideOverlay =
        loggedInPlayer.pendingPlayCardFromHand || loggedInPlayer.pendingTilePlacement;
    const showBoardFirstInActionPrompt = isPlayerMakingDecision && hideOverlay;
    let actionBarPromptText: string | null;
    if (gameStage === GameStage.CORPORATION_SELECTION) {
        actionBarPromptText = 'Choose your corporation and starting cards';
    } else if (gameStage === GameStage.END_OF_GAME) {
        actionBarPromptText = null;
    } else if (loggedInPlayer.pendingPlayCardFromHand) {
        actionBarPromptText = 'Play a card from hand';
    } else if (loggedInPlayer.pendingTilePlacement) {
        if (loggedInPlayer.pendingTilePlacement.type === TileType.LAND_CLAIM) {
            actionBarPromptText = 'Claim an unreserved area.';
        } else {
            actionBarPromptText = `Place ${aAnOrThe(
                loggedInPlayer.pendingTilePlacement.type
            )} ${getHumanReadableTileName(loggedInPlayer.pendingTilePlacement.type)} tile.`;
        }
    } else {
        actionBarPromptText = 'Complete your action';
    }

    const [isActionOverlayVisible, setIsActionOverlayVisible] = useState(
        !showBoardFirstInActionPrompt
    );

    useIsomorphicLayoutEffect(() => {
        if (typeof document === 'undefined') return;
        document.body.style.overflow =
            isActionOverlayVisible && isPlayerMakingDecision ? 'hidden' : 'initial';
    }, [isActionOverlayVisible && isPlayerMakingDecision && !hideOverlay]);

    return (
        <React.Fragment>
            <Flex flexDirection="column" flex="auto" bottom="0px">
                <Flex flex="none">
                    <TopBar loggedInPlayer={loggedInPlayer} />
                </Flex>
                {isPlayerMakingDecision && (
                    <ActionOverlayTopBar
                        hideOverlay={!!hideOverlay}
                        setIsVisible={() => setIsActionOverlayVisible(!isActionOverlayVisible)}
                        promptText={actionBarPromptText ?? ''}
                    />
                )}
                {isPlayerMakingDecision && !hideOverlay && (
                    <ActionOverlay isVisible={isActionOverlayVisible}>
                        {gameStage === GameStage.END_OF_GAME && <EndOfGame />}
                        {loggedInPlayer.pendingChoice && (
                            <AskUserToMakeActionChoice player={loggedInPlayer} />
                        )}
                        {loggedInPlayer.pendingActionReplay && (
                            <AskUserToUseBlueCardActionAlreadyUsedThisGeneration
                                player={loggedInPlayer}
                            />
                        )}
                        {loggedInPlayer.pendingPlayCardFromHand && (
                            <AskUserToPlayCardFromHand player={loggedInPlayer} />
                        )}
                        {loggedInPlayer.pendingDuplicateProduction && (
                            <AskUserToDuplicateProduction player={loggedInPlayer} />
                        )}
                        {loggedInPlayer.pendingIncreaseLowestProduction && (
                            <AskUserToIncreaseLowestProduction player={loggedInPlayer} />
                        )}
                        {loggedInPlayer.pendingDiscard && (
                            <AskUserToMakeDiscardChoice player={loggedInPlayer} />
                        )}
                        {loggedInPlayer.pendingCardSelection && (
                            <AskUserToMakeCardSelection player={loggedInPlayer} />
                        )}
                        {(loggedInPlayer?.preludes?.length ?? 0) > 0 &&
                            currentPlayerIndex === loggedInPlayer.index &&
                            !loggedInPlayer.pendingPlayCardFromHand &&
                            !loggedInPlayer.pendingTilePlacement &&
                            players.every(
                                player =>
                                    (player.preludes?.length ?? 0) > 0 ||
                                    player.playedCards?.filter(
                                        c => getCard(c).type === CardType.PRELUDE
                                    )
                            ) && <AskUserToPlayPrelude player={loggedInPlayer} />}
                        {loggedInPlayer.fundAward && <AskUserToFundAward player={loggedInPlayer} />}
                        {loggedInPlayer.pendingTilePlacement && (
                            <PromptTitle>{actionBarPromptText}</PromptTitle>
                        )}
                        {loggedInPlayer.pendingResourceActionDetails && (
                            <AskUserToConfirmResourceActionDetails
                                player={loggedInPlayer}
                                resourceActionDetails={loggedInPlayer.pendingResourceActionDetails}
                            />
                        )}
                        {revealedCards.length > 0 && (
                            <Flex flexDirection="column">
                                <span style={{marginBottom: 16}}>
                                    Card{revealedCards.length > 1 ? 's' : ''} revealed & discarded:
                                </span>
                                <Flex flexWrap="wrap">
                                    {revealedCards.map((card, index) => {
                                        return <CardComponent key={index} card={getCard(card)} />;
                                    })}
                                </Flex>
                                <Flex justifyContent="center" marginTop="16px">
                                    <button onClick={continueAfterRevealingCards}>Continue</button>
                                </Flex>
                            </Flex>
                        )}
                    </ActionOverlay>
                )}
                <Flex
                    paddingTop="8px"
                    className="active-round-outer"
                    flex="auto"
                    alignItems="flex-start"
                >
                    <Flex className="active-round-left" flexDirection="column" width="100%">
                        <Flex
                            className="player-details"
                            marginRight="8px"
                            marginBottom="8px"
                            paddingTop="4px"
                            overflowX="hidden"
                        >
                            <Box
                                className="player-boards-outer"
                                overflowX="auto"
                                flexShrink="0"
                                marginBottom="16px"
                            >
                                <Flex className="player-boards" width="fit-content">
                                    {players.map((player, index) => (
                                        <CorporationHeaderOuter
                                            selected={index === selectedPlayerIndex}
                                            className="display"
                                            key={index}
                                            onClick={() => setSelectedPlayerIndex(index)}
                                        >
                                            {index === firstPlayerIndex && (
                                                <FirstPlayerToken>1</FirstPlayerToken>
                                            )}
                                            <CorporationHeader>
                                                <Flex alignItems="center">
                                                    <PlayerIcon
                                                        size={16}
                                                        playerIndex={player.index}
                                                    />
                                                    <span
                                                        style={{
                                                            marginLeft: 8,
                                                            fontSize: getFontSizeForCorporation(
                                                                player.corporation.name ||
                                                                    player.username
                                                            ),
                                                        }}
                                                        title={`${player.corporation.name ?? ''} (${
                                                            player.username
                                                        })`}
                                                    >
                                                        {player.corporation.name || player.username}
                                                    </span>
                                                </Flex>
                                                <ScorePopover playerIndex={player.index}>
                                                    <TerraformRating>
                                                        {player.terraformRating} TR
                                                    </TerraformRating>
                                                </ScorePopover>
                                            </CorporationHeader>
                                            {!isCorporationSelection && (
                                                <PlayerResourceBoard
                                                    player={player}
                                                    isLoggedInPlayer={
                                                        player.index === loggedInPlayer.index
                                                    }
                                                />
                                            )}
                                        </CorporationHeaderOuter>
                                    ))}
                                </Flex>
                            </Box>
                            <Flex
                                borderColor={PLAYER_COLORS[selectedPlayerIndex]}
                                borderRadius="4px"
                                borderStyle="solid"
                                borderWidth="3px"
                                flexWrap="wrap"
                                background="#333"
                                justifyContent="center"
                                overflowY="auto"
                                className="player-cards-and-tags"
                                width="fit-content"
                                marginLeft="8px"
                                marginRight="8px"
                            >
                                <Flex margin="2px">
                                    <PlayerPanel player={players[selectedPlayerIndex]} />
                                </Flex>
                            </Flex>
                        </Flex>
                        <Colonies />
                    </Flex>

                    <Flex className="active-round-right" flexDirection="column">
                        <Box className="board-wrapper">
                            <Board />
                        </Box>
                    </Flex>
                </Flex>
            </Flex>
            <PlayerHand player={loggedInPlayer} />
        </React.Fragment>
    );
};
