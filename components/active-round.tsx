import AskUserToConfirmResourceActionDetails from 'components/ask-user-to-confirm-resource-action-details';
import {AskUserToMakeCardSelection} from 'components/ask-user-to-make-card-selection';
import {AskUserToMakeDiscardChoice} from 'components/ask-user-to-make-discard-choice';
import {Board} from 'components/board/board';
import {Card as CardComponent} from 'components/card/Card';
import {PlayerHand} from 'components/player-hand';
import {TopBar} from 'components/top-bar';
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
import React, {ReactElement, useEffect, useState} from 'react';
import {useTypedSelector} from 'reducer';
import {
    isDrafting as isDraftingSelector,
    isWaitingOnOthersToDraft as isWaitingOnOthersToDraftSelector,
} from 'selectors/drafting';
import {getCard} from 'selectors/get-card';
import {aAnOrThe, getHumanReadableTileName} from 'selectors/get-human-readable-tile-name';
import {getIsPlayerMakingDecision} from 'selectors/get-is-player-making-decision';
import styled from 'styled-components';
import {ActionTable} from './action-table';
import {AskUserToChooseNextAction} from './ask-user-to-choose-next-action';
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
import {DisplayBoard} from './board-switcher';
import {Box, Flex} from './box';
import {EndOfGame} from './end-of-game';
import GlobalParams from './global-params';
import {LogToast} from './log-toast';

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
            loggedInPlayer.fundAward ||
            loggedInPlayer.placeDelegatesInOneParty ||
            loggedInPlayer.removeNonLeaderDelegate ||
            loggedInPlayer.exchangeNeutralNonLeaderDelegate
    );
    const showBoardFirstInActionPrompt = isPlayerMakingDecision && hideOverlay;
    const isWaitingOnOthersToDraft = useTypedSelector(state =>
        isWaitingOnOthersToDraftSelector(state)
    );
    const isDrafting = useTypedSelector(state => isDraftingSelector(state));
    let actionBarPromptText: string | null;
    if (gameStage === GameStage.CORPORATION_SELECTION) {
        actionBarPromptText = 'Corporation Selection';
    } else if (gameStage === GameStage.END_OF_GAME) {
        actionBarPromptText = 'Game End';
    } else if (loggedInPlayer.pendingPlayCardFromHand) {
        actionBarPromptText = 'Play card from hand';
    } else if (loggedInPlayer.putAdditionalColonyTileIntoPlay) {
        actionBarPromptText = 'Add colony';
    } else if (loggedInPlayer.pendingTilePlacement) {
        if (loggedInPlayer.pendingTilePlacement.type === TileType.LAND_CLAIM) {
            actionBarPromptText = 'Claim unreserved area.';
        } else {
            actionBarPromptText = `Place ${aAnOrThe(
                loggedInPlayer.pendingTilePlacement.type
            )} ${getHumanReadableTileName(loggedInPlayer.pendingTilePlacement.type)} tile`;
        }
    } else if (loggedInPlayer.pendingTileRemoval) {
        actionBarPromptText = `Remove ${aAnOrThe(
            loggedInPlayer.pendingTileRemoval
        )} ${getHumanReadableTileName(loggedInPlayer.pendingTileRemoval)} tile`;
    } else if (loggedInPlayer.fundAward) {
        actionBarPromptText = 'Fund award';
    } else if (loggedInPlayer.placeColony) {
        actionBarPromptText = 'Place colony';
    } else if (loggedInPlayer.tradeForFree) {
        actionBarPromptText = 'Trade for free';
    } else if (loggedInPlayer.increaseAndDecreaseColonyTileTracks) {
        actionBarPromptText = 'Action';
    } else if (loggedInPlayer.placeDelegatesInOneParty) {
        const plural = loggedInPlayer.placeDelegatesInOneParty > 1;
        actionBarPromptText = `Place ${loggedInPlayer.placeDelegatesInOneParty} delegate${
            plural ? 's' : ''
        }`;
    } else if (loggedInPlayer.removeNonLeaderDelegate) {
        actionBarPromptText = 'Remove non-leader delegate';
    } else if (loggedInPlayer.exchangeNeutralNonLeaderDelegate) {
        actionBarPromptText = 'Exchange neutral non-leader-delegate';
    } else if (isWaitingOnOthersToDraft) {
        actionBarPromptText = 'Draft';
    } else if (isDrafting) {
        actionBarPromptText = 'Draft';
    } else if (loggedInPlayer.pendingCardSelection) {
        actionBarPromptText = 'Select cards';
    } else {
        actionBarPromptText = 'Action';
    }

    const topBarRef = React.useRef<HTMLDivElement>(null);
    const logLength = useTypedSelector(state => state.logLength);
    const parameters = useTypedSelector(state => state.common.parameters);
    const [displayBoard, setDisplayBoard] = useState(DisplayBoard.MARS);

    const playerCardsString = useTypedSelector(state =>
        state.players[loggedInPlayer.index].cards.map(card => card.name).join('-')
    );

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
            case revealedCards.length > 0 &&
                (state.common.controllingPlayerIndex ?? state.common.currentPlayerIndex) ===
                    loggedInPlayer.index:
                actionOverlayElement = (
                    <Flex flexDirection="column">
                        <span style={{marginBottom: 16, color: '#ccc'}}>
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
            <Flex
                flexDirection="column"
                alignItems="center"
                flex="auto"
                bottom="0px"
                padding="0 0 100px 0"
            >
                <TopBar ref={topBarRef} yourTurnGames={yourTurnGames} />

                <Box className="active-round-outer" flex="auto">
                    <ActionTable
                        actionPrompt={{
                            element: actionOverlayElement,
                            text: actionBarPromptText,
                            buttonNeeded: !showBoardFirstInActionPrompt,
                        }}
                    />
                    <Flex className="board-and-params">
                        <Board displayBoard={displayBoard} setDisplayBoard={setDisplayBoard} />
                        <GlobalParams parameters={parameters} />
                    </Flex>
                </Box>
            </Flex>
            <PlayerHand gameName={gameName} playerCardsString={playerCardsString} />
        </GlobalPopoverContext.Provider>
    );
};
