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
import PlayerPanel from 'components/player-panel/player-bottom-panel';
import {ScorePopover} from 'components/popovers/score-popover';
import {PlayerResourceBoard} from 'components/player-panel/player-resource-board';
import {TopBar} from 'components/top-bar';
import {colors} from 'components/ui';
import {TileType} from 'constants/board';
import {CardType} from 'constants/card-types';
import {GameStage} from 'constants/game';
import {
    GlobalPopoverContext,
    GlobalPopoverManager,
    PopoverConfig,
    PopoverConfigByType,
    PopoverType,
} from 'context/global-popover-context';
import {useApiClient} from 'hooks/use-api-client';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import {useWindowWidth} from 'hooks/use-window-width';
import React, {ReactElement, useEffect, useLayoutEffect, useState} from 'react';
import {useTypedSelector} from 'reducer';
import {getCard} from 'selectors/get-card';
import {aAnOrThe, getHumanReadableTileName} from 'selectors/get-human-readable-tile-name';
import {getIsPlayerMakingDecision} from 'selectors/get-is-player-making-decision';
import styled from 'styled-components';
import {useIsomorphicLayoutEffect} from './action-log';
import {ActionOverlay, ActionOverlayTopBar} from './action-overlay';
import {Controller} from 'swiper';
import {Swiper, SwiperSlide} from 'swiper/react';
import {AskUserToChooseNextAction, getPlayerIndex} from './ask-user-to-choose-next-action';
import {AskUserToDuplicateProduction} from './ask-user-to-confirm-duplicate-production';
import {AskUserToFundAward} from './ask-user-to-fund-award';
import {AskUserToGainStandardResources} from './ask-user-to-gain-standard-resources';
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
import {PlayerResourcePanel} from './player-resource-panel';
import {PlayerPanels} from './player-panel/player-panels';

const PromptTitle = styled.h3`
    margin-top: 16px;
`;

export const ActiveRound = ({yourTurnGames}: {yourTurnGames: string[]}) => {
    /**
     * Hooks
     */
    const players = useTypedSelector(state => state.players);
    const gameName = useTypedSelector(state => state.name);
    const loggedInPlayer = useLoggedInPlayer();
    const currentPlayerIndex = useTypedSelector(state => state.common.currentPlayerIndex);
    const [popoverConfigByType, setPopoverConfigByType] = useState<PopoverConfigByType>({});

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
            loggedInPlayer.pendingTileRemoval ||
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
    } else if (loggedInPlayer.pendingTileRemoval) {
        actionBarPromptText = `Remove ${aAnOrThe(
            loggedInPlayer.pendingTileRemoval
        )} ${getHumanReadableTileName(loggedInPlayer.pendingTileRemoval)} tile.`;
    } else if (loggedInPlayer.fundAward) {
        actionBarPromptText = 'Fund an award for free';
    } else if (loggedInPlayer.placeColony) {
        actionBarPromptText = 'Place a colony';
    } else if (loggedInPlayer.tradeForFree) {
        actionBarPromptText = 'Select a colony to trade with for free';
    } else if (loggedInPlayer.increaseAndDecreaseColonyTileTracks) {
        actionBarPromptText = 'Increase and decrease colony tile tracks';
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

    const playerCardsString = useTypedSelector(state =>
        state.players[loggedInPlayer.index].cards.map(card => card.name).join('-')
    );

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
            case !!loggedInPlayer.pendingGainStandardResources:
                actionOverlayElement = <AskUserToGainStandardResources player={loggedInPlayer} />;
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
                !loggedInPlayer.pendingNextActionChoice &&
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
            case !!loggedInPlayer.pendingTileRemoval:
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
            case (loggedInPlayer.pendingNextActionChoice?.length ?? 0) > 0:
                actionOverlayElement = <AskUserToChooseNextAction player={loggedInPlayer} />;
                break;
        }
        return actionOverlayElement;
    });

    if (!players[selectedPlayerIndex]) return null;

    return (
        <GlobalPopoverContext.Provider
            value={{
                setPopoverConfigByType(type: PopoverType, config: PopoverConfig) {
                    setPopoverConfigByType({...popoverConfigByType, [type]: config});
                },
                popoverConfigByType,
            }}
        >
            <GlobalPopoverManager />
            <LogToast />
            <Flex flexDirection="column" alignItems="center" flex="auto" bottom="0px">
                <TopBar ref={topBarRef} yourTurnGames={yourTurnGames} />
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

                <Box className="active-round-outer" paddingTop="8px" flex="auto">
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
                <Box className="player-panels" paddingTop="4px" width="100%" padding="0 0 100px 0">
                    <PlayerPanels />
                </Box>
            </Flex>
            <PlayerHand gameName={gameName} playerCardsString={playerCardsString} />
        </GlobalPopoverContext.Provider>
    );
};
