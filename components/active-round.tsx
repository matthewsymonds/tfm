import AskUserToConfirmResourceActionDetails from 'components/ask-user-to-confirm-resource-action-details';
import {AskUserToMakeCardSelection} from 'components/ask-user-to-make-card-selection';
import {AskUserToMakeDiscardChoice} from 'components/ask-user-to-make-discard-choice';
import {
    AwardsAndMilestones,
    Board,
    MilestonesAwardsBoardSwitcherWrapper,
} from 'components/board/board';
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
import {GameStage} from 'constants/game';
import {
    GlobalPopoverContext,
    GlobalPopoverManager,
    PopoverConfig,
} from 'context/global-popover-context';
import {useApiClient} from 'hooks/use-api-client';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import {useWindowWidth} from 'hooks/use-window-width';
import Link from 'next/link';
import React, {ReactElement, useEffect, useLayoutEffect, useState} from 'react';
import {useTypedSelector} from 'reducer';
import {getCard} from 'selectors/get-card';
import {aAnOrThe, getHumanReadableTileName} from 'selectors/get-human-readable-tile-name';
import {getIsPlayerMakingDecision} from 'selectors/get-is-player-making-decision';
import styled from 'styled-components';
import {useIsomorphicLayoutEffect} from './action-log';
import {ActionOverlay, ActionOverlayTopBar} from './action-overlay';
import {AskUserToChooseNextAction} from './ask-user-to-choose-next-action';
import {AskUserToDuplicateProduction} from './ask-user-to-confirm-duplicate-production';
import {AskUserToFundAward} from './ask-user-to-fund-award';
import {AskUserToIncreaseAndDecreaseColonyTileTracks} from './ask-user-to-increase-and-decrease-colony-tile-tracks';
import {AskUserToIncreaseLowestProduction} from './ask-user-to-increase-lowest-production';
import {AskUserToMakeActionChoice} from './ask-user-to-make-action-choice';
import {AskUserToPlayCardFromHand} from './ask-user-to-play-card-from-hand';
import {AskUserToPlayPrelude} from './ask-user-to-play-prelude';
import {AskUserToPutAdditionalColonyTileIntoPlay} from './ask-user-to-put-additional-colony-tile-into-play';
import {AskUserToUseBlueCardActionAlreadyUsedThisGeneration} from './ask-user-to-use-blue-card-action-already-used-this-generation';
import {BoardSwitcher, DisplayBoard} from './board-switcher';
import AwardsList from './board/board-actions/awards';
import MilestonesList from './board/board-actions/milestones';
import {Box, Flex} from './box';
import {EndOfGame} from './end-of-game';
import GlobalParams from './global-params';
import {LogToast} from './log-toast';

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
    margin-top: 0px;
    margin-bottom: 0px;
`;

const CorporationHeaderOuter = styled.div<{selected: boolean}>`
    display: inline-block;
    position: relative;
    margin-right: 16px;
    margin-top: 12px;
    margin-bottom: 12px;
    padding: 8px;
    background: ${props => (props.selected ? colors.DARK_3 : 'transparent')};
    border: 1px solid ${props => (props.selected ? colors.PANEL_BORDER : 'transparent')};
    border-radius: 4px;
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

const YourTurnLink = styled.a`
    &:link,
    &:visited,
    &:hover,
    &:active {
        color: #ddd;
    }
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

export const ActiveRound = ({yourTurnGames}: {yourTurnGames: string[]}) => {
    /**
     * Hooks
     */
    const players = useTypedSelector(state => state.players);
    const gameName = useTypedSelector(state => state.name);
    const loggedInPlayer = useLoggedInPlayer();
    const currentPlayerIndex = useTypedSelector(state => state.common.currentPlayerIndex);
    const firstPlayerIndex = useTypedSelector(state => state.common.firstPlayerIndex);
    const isCorporationSelection = useTypedSelector(
        state => state.common.gameStage === GameStage.CORPORATION_SELECTION
    );
    const [popoverConfig, setPopoverConfig] = useState<PopoverConfig | null>(null);

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
    useEffect(() => {
        setSelectedPlayerIndex(loggedInPlayer.index);
    }, [gameName]);

    const hideOverlay = useTypedSelector(
        state =>
            loggedInPlayer.pendingPlayCardFromHand ||
            loggedInPlayer.pendingTilePlacement ||
            loggedInPlayer.placeColony ||
            loggedInPlayer.tradeForFree ||
            loggedInPlayer.fundAward
    );
    const showBoardFirstInActionPrompt = isPlayerMakingDecision && hideOverlay;
    const shouldHidePlayerDetails = useTypedSelector(
        state => isPlayerMakingDecision && !hideOverlay && isActionOverlayVisible
    );
    let actionBarPromptText: string | null;
    if (gameStage === GameStage.CORPORATION_SELECTION) {
        actionBarPromptText = 'Choose your corporation and starting cards';
    } else if (gameStage === GameStage.END_OF_GAME) {
        actionBarPromptText = null;
    } else if (loggedInPlayer.pendingPlayCardFromHand) {
        actionBarPromptText = 'Play a card from hand';
    } else if (loggedInPlayer.putAdditionalColonyTileIntoPlay) {
        actionBarPromptText = 'Put an additional colony into play.';
    } else if (loggedInPlayer.pendingTilePlacement) {
        if (loggedInPlayer.pendingTilePlacement.type === TileType.LAND_CLAIM) {
            actionBarPromptText = 'Claim an unreserved area.';
        } else {
            actionBarPromptText = `Place ${aAnOrThe(
                loggedInPlayer.pendingTilePlacement.type
            )} ${getHumanReadableTileName(loggedInPlayer.pendingTilePlacement.type)} tile.`;
        }
    } else if (loggedInPlayer.fundAward) {
        actionBarPromptText = 'Fund an award for free';
    } else if (loggedInPlayer.placeColony) {
        actionBarPromptText = 'Place a colony';
    } else if (loggedInPlayer.tradeForFree) {
        actionBarPromptText = 'Select a colony to trade with for free';
    } else if (loggedInPlayer.increaseAndDecreaseColonyTileTracks) {
        actionBarPromptText = 'Increase and decrease colony tile tracks';
    } else if (loggedInPlayer.illegalStateReached) {
        actionBarPromptText = 'You have failed to pay for your action.';
    } else {
        actionBarPromptText = 'Complete your action';
    }

    const [isActionOverlayVisible, setIsActionOverlayVisible] = useState(
        !showBoardFirstInActionPrompt
    );

    useEffect(() => {
        if (!hideOverlay && !showBoardFirstInActionPrompt) {
            setIsActionOverlayVisible(true);
        }
    }, [!hideOverlay && !showBoardFirstInActionPrompt]);

    const topBarRef = React.useRef<HTMLDivElement>(null);
    const logLength = useTypedSelector(state => state.logLength);
    const [topBarHeight, setTopBarHeight] = useState(48);
    const parameters = useTypedSelector(state => state.common.parameters);
    const windowWidth = useWindowWidth();
    const [displayBoard, setDisplayBoard] = useState(DisplayBoard.MARS);

    useLayoutEffect(() => {
        if (topBarRef.current) {
            setTopBarHeight(topBarRef.current.offsetHeight);
        }
        const handleResize = function (this: Window, event: UIEvent) {
            if (topBarRef.current) {
                setTopBarHeight(topBarRef.current.offsetHeight);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [topBarRef.current?.offsetHeight]);

    useEffect(() => {
        if (topBarRef.current) {
            setTopBarHeight(topBarRef.current.offsetHeight);
        }
    }, [topBarRef.current, logLength]);

    const isLoggedInPlayersTurn = currentPlayerIndex === loggedInPlayer.index;
    const isActiveRound = gameStage === GameStage.ACTIVE_ROUND;
    const {draftPicks = [], possibleCards = []} = loggedInPlayer?.pendingCardSelection ?? {
        draftPicks: [],
        possibleCards: [],
    };
    const isPickingCards = (draftPicks?.length ?? 0) + (possibleCards?.length ?? 0) === 4;

    const playing =
        (loggedInPlayer.action > 0 && isLoggedInPlayersTurn && isActiveRound) || isPickingCards;
    const onlyOnePlayer = useTypedSelector(state => state.players.length === 1);

    const playerCardsString = useTypedSelector(state =>
        state.players[loggedInPlayer.index].cards.map(card => card.name).join('-')
    );

    const currentGame = useTypedSelector(state => state.name);

    const yourTurnGamesFiltered = yourTurnGames.filter(game => game !== currentGame);

    const yourTurnMessage =
        yourTurnGamesFiltered.length > 0 && (!playing || onlyOnePlayer) ? (
            <Box marginRight="8px" display="inline-block" fontStyle="italic">
                It is your turn in {yourTurnGamesFiltered.length} game
                {yourTurnGamesFiltered.length === 1 ? '' : 's'}:
            </Box>
        ) : null;

    const yourTurnLink = `/games/${yourTurnGamesFiltered[0]}`;

    useIsomorphicLayoutEffect(() => {
        if (typeof document === 'undefined') return;
        if (isActionOverlayVisible && isPlayerMakingDecision) {
            window.requestAnimationFrame(() => {
                topBarRef.current?.scrollIntoView();
            });
        }
        document.body.style.overflow =
            isActionOverlayVisible && isPlayerMakingDecision && !hideOverlay ? 'hidden' : 'initial';
    }, [isActionOverlayVisible && isPlayerMakingDecision && !hideOverlay, topBarRef.current]);

    const actionOverlayElement = useTypedSelector(state => {
        let actionOverlayElement: ReactElement | null = null;
        switch (true) {
            case gameStage === GameStage.END_OF_GAME:
                actionOverlayElement = <EndOfGame />;
                break;
            case loggedInPlayer.prioritizePendingActionChoice &&
                (loggedInPlayer.pendingActionChoice?.length ?? 0) > 0:
                actionOverlayElement = <AskUserToChooseNextAction player={loggedInPlayer} />;
                break;
            case !!loggedInPlayer.pendingChoice:
                actionOverlayElement = <AskUserToMakeActionChoice player={loggedInPlayer} />;
                break;
            case loggedInPlayer.pendingActionReplay:
                actionOverlayElement = (
                    <AskUserToUseBlueCardActionAlreadyUsedThisGeneration player={loggedInPlayer} />
                );
                break;
            case loggedInPlayer.pendingPlayCardFromHand:
                actionOverlayElement = <AskUserToPlayCardFromHand player={loggedInPlayer} />;
                break;
            case !!loggedInPlayer.pendingDuplicateProduction:
                actionOverlayElement = <AskUserToDuplicateProduction player={loggedInPlayer} />;
                break;
            case !!loggedInPlayer.pendingIncreaseLowestProduction:
                actionOverlayElement = (
                    <AskUserToIncreaseLowestProduction player={loggedInPlayer} />
                );
                break;
            case !!loggedInPlayer.pendingDiscard:
                actionOverlayElement = <AskUserToMakeDiscardChoice player={loggedInPlayer} />;
                break;
            case !!loggedInPlayer.pendingCardSelection:
                actionOverlayElement = <AskUserToMakeCardSelection player={loggedInPlayer} />;
                break;
            case !!loggedInPlayer.increaseAndDecreaseColonyTileTracks:
                actionOverlayElement = (
                    <AskUserToIncreaseAndDecreaseColonyTileTracks player={loggedInPlayer} />
                );
                break;
            case !!loggedInPlayer.putAdditionalColonyTileIntoPlay:
                actionOverlayElement = (
                    <AskUserToPutAdditionalColonyTileIntoPlay player={loggedInPlayer} />
                );
                break;
            case (loggedInPlayer?.preludes?.length ?? 0) > 0 &&
                currentPlayerIndex === loggedInPlayer.index &&
                !loggedInPlayer.pendingPlayCardFromHand &&
                !loggedInPlayer.pendingTilePlacement &&
                players.every(
                    player =>
                        (player.preludes?.length ?? 0) > 0 ||
                        player.playedCards?.filter(c => getCard(c).type === CardType.PRELUDE)
                ):
                actionOverlayElement = <AskUserToPlayPrelude player={loggedInPlayer} />;
                break;
            case !!loggedInPlayer.fundAward:
                actionOverlayElement = <AskUserToFundAward player={loggedInPlayer} />;
                break;
            case !!loggedInPlayer.pendingTilePlacement:
                actionOverlayElement = <PromptTitle>{actionBarPromptText}</PromptTitle>;
                break;
            case !!loggedInPlayer.pendingResourceActionDetails:
                actionOverlayElement = (
                    <AskUserToConfirmResourceActionDetails
                        player={loggedInPlayer}
                        resourceActionDetails={loggedInPlayer.pendingResourceActionDetails!}
                    />
                );
                break;
            case revealedCards.length > 0:
                actionOverlayElement = (
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
                );
                break;
            // This should be last...It's saying "ask the user which item they want to handle next"
            case !loggedInPlayer.prioritizePendingActionChoice &&
                (loggedInPlayer.pendingActionChoice?.length ?? 0) > 0:
                actionOverlayElement = <AskUserToChooseNextAction player={loggedInPlayer} />;
                break;
        }
        return actionOverlayElement;
    });

    if (!players[selectedPlayerIndex]) return null;

    return (
        <GlobalPopoverContext.Provider
            value={{
                setPopoverConfig: e => {
                    setPopoverConfig(e);
                },
                popoverConfig,
            }}
        >
            <GlobalPopoverManager />
            <LogToast />
            <Flex flexDirection="column" alignItems="center" flex="auto" bottom="0px">
                <TopBar ref={topBarRef} />
                {isPlayerMakingDecision && (
                    <ActionOverlayTopBar
                        hideOverlay={!!hideOverlay}
                        setIsVisible={() => setIsActionOverlayVisible(!isActionOverlayVisible)}
                        promptText={actionBarPromptText ?? ''}
                    />
                )}
                {isPlayerMakingDecision && !hideOverlay && (
                    <ActionOverlay isVisible={isActionOverlayVisible} topBarHeight={topBarHeight}>
                        {actionOverlayElement}
                    </ActionOverlay>
                )}
                {yourTurnMessage ? (
                    <Box padding="8px" color="#ddd" alignSelf="flex-start">
                        {yourTurnMessage}
                        <Link href={yourTurnLink}>
                            <YourTurnLink href={yourTurnLink}>Click</YourTurnLink>
                        </Link>
                    </Box>
                ) : null}
                <Box paddingTop="8px" className="active-round-outer" flex="auto">
                    <div className="empty-space-left" />
                    <div className="empty-space-right" />
                    <Box
                        className="player-boards-outer"
                        overflowX="auto"
                        flexShrink="0"
                        paddingTop="4px"
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
                                            <PlayerIcon size={16} playerIndex={player.index} />
                                            <span
                                                style={{
                                                    marginLeft: 8,
                                                    fontSize: getFontSizeForCorporation(
                                                        player.corporation.name || player.username
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
                                            isLoggedInPlayer={player.index === loggedInPlayer.index}
                                        />
                                    )}
                                </CorporationHeaderOuter>
                            ))}
                        </Flex>
                    </Box>
                    <Box className="player-cards-and-tags-outer" marginBottom="8px">
                        {shouldHidePlayerDetails ? null : (
                            <Flex
                                flexGrow="1"
                                flexWrap="wrap"
                                background={colors.DARK_3}
                                border={`1px solid ${colors.PANEL_BORDER}`}
                                borderRadius="4px"
                                justifyContent="center"
                                boxSizing="border-box"
                                overflowY="auto"
                                width="100%"
                                className="player-cards-and-tags"
                            >
                                <Flex margin="2px" flexGrow="1">
                                    <PlayerPanel player={players[selectedPlayerIndex]} />
                                </Flex>
                            </Flex>
                        )}
                    </Box>
                    <GlobalParams parameters={parameters} />
                    <Board displayBoard={displayBoard} setDisplayBoard={setDisplayBoard} />
                    <MilestonesAwardsBoardSwitcherWrapper className="milestones-awards-board-switcher-wrapper">
                        {windowWidth > 895 && (
                            <BoardSwitcher
                                setDisplayBoard={setDisplayBoard}
                                selectedBoard={displayBoard}
                            />
                        )}
                        <AwardsAndMilestones>
                            <MilestonesList loggedInPlayer={loggedInPlayer} />
                            <AwardsList loggedInPlayer={loggedInPlayer} />
                        </AwardsAndMilestones>
                    </MilestonesAwardsBoardSwitcherWrapper>
                </Box>
            </Flex>
            <PlayerHand gameName={gameName} playerCardsString={playerCardsString} />
        </GlobalPopoverContext.Provider>
    );
};
