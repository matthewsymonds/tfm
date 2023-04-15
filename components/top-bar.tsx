import {ActionLog} from 'components/action-log';
import {Box, Flex} from 'components/box';
import {Button} from 'components/button';
import {PlayerCorpAndIcon, PlayerIcon} from 'components/icons/player';
import {colors} from 'components/ui';
import {DEFAULT_CONVERSIONS} from 'constants/conversion';
import {GameStage} from 'constants/game';
import {Resource} from 'constants/resource-enum';
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import Link from 'next/link';
import {useRouter} from 'next/router';
import React, {forwardRef} from 'react';
import Twemoji from 'react-twemoji';
import {useTypedSelector} from 'reducer';
import {isActionPhase} from 'selectors/is-action-phase';
import {isPlayingPrelude} from 'selectors/is-playing-expansion';
import styled from 'styled-components';
import {BlankButton} from './blank-button';

const TopBarBase = styled(Box)`
    display: flex;
    width: 100%;
    overflow: auto;
    justify-content: flex-start;
    align-items: center;
    color: ${colors.LIGHT_2};
`;

const YourTurnLink = styled.a`
    &:link,
    &:visited,
    &:hover,
    &:active {
        color: #ddd;
    }
`;

const CorporationName = styled(Flex)`
    margin: 0;
    font-size: 36px;
    line-height: 1.1;
    margin-right: 12px;
    font-family: 'Ubuntu Condensed', sans-serif;
    font-weight: bold;
`;

export const TopBar = forwardRef<HTMLDivElement, {yourTurnGames: string[]}>(
    ({yourTurnGames}, ref) => {
        const currentGame = useTypedSelector(state => state.name);

        const router = useRouter();
        const apiClient = useApiClient();
        const loggedInPlayer = useLoggedInPlayer();

        const yourTurnGamesFiltered = yourTurnGames.filter(
            game => game !== currentGame
        );

        const isActiveRound = useTypedSelector(
            state => state.common.gameStage === GameStage.ACTIVE_ROUND
        );

        /**
         * State selectors
         */
        const currentPlayerIndex = useTypedSelector(
            state => state.common.currentPlayerIndex
        );
        const players = useTypedSelector(state => state.players);
        const syncing = useTypedSelector(state => state.syncing);

        /**
         * Derived state
         */
        const {
            index: loggedInPlayerIndex,
            action,
            pendingCardSelection,
        } = loggedInPlayer;
        const isLoggedInPlayerInControl = useTypedSelector(
            state => state.common.controllingPlayerIndex === loggedInPlayerIndex
        );
        const isControlUnceded = useTypedSelector(
            state => state.common.controllingPlayerIndex === undefined
        );
        const isGreeneryPlacement = useTypedSelector(
            state => state.common.gameStage === GameStage.GREENERY_PLACEMENT
        );
        const isEndOfGame = useTypedSelector(
            state => state.common.gameStage === GameStage.END_OF_GAME
        );
        const hasPendingCardSelection = useTypedSelector(
            state => !!pendingCardSelection
        );
        const currentPlayer = useTypedSelector(
            state =>
                players[
                    state.common.controllingPlayerIndex ?? currentPlayerIndex
                ]
        );
        const isLoggedInPlayersTurn =
            currentPlayerIndex === loggedInPlayer.index;
        const isLoggedInPlayerPassed = useTypedSelector(
            state => action === 0 && isActionPhase(state)
        );

        const playing =
            loggedInPlayer.action > 0 &&
            (isLoggedInPlayersTurn || isLoggedInPlayerInControl) &&
            isActiveRound;

        const topBarColor =
            isLoggedInPlayersTurn ||
            hasPendingCardSelection ||
            isLoggedInPlayerInControl
                ? colors.NAV_BG_YOUR_TURN
                : isLoggedInPlayerPassed
                ? colors.NAV_BG_PASSED
                : colors.NAV_BG_WAITING;

        const onlyOnePlayer = useTypedSelector(
            state => state.players.length === 1
        );
        const yourTurnMessage =
            yourTurnGamesFiltered.length > 0 && (!playing || onlyOnePlayer) ? (
                <Box
                    marginRight="8px"
                    display="inline-block"
                    fontStyle="italic"
                >
                    It is your turn in {yourTurnGamesFiltered.length} game
                    {yourTurnGamesFiltered.length === 1 ? '' : 's'}:
                </Box>
            ) : null;

        const yourTurnLink = `/games/${yourTurnGamesFiltered[0]}`;

        const actionGuard = useActionGuard();

        const color = `linear-gradient(to right, rgba(255,255,255,0) 0px, ${topBarColor} 100px, rgba(255,255,255,0) 220px);`;

        const greeneryPlacementText = actionGuard.canDoConversion(
            DEFAULT_CONVERSIONS[Resource.PLANT]
        )[0]
            ? 'You may place a greenery.'
            : 'Cannot place any more greeneries.';

        const canSkip = useTypedSelector(
            state => actionGuard.canSkipAction()[0]
        );
        const canPass = useTypedSelector(
            state => actionGuard.canPassGeneration()[0]
        );
        const isPreludesEnabled = useTypedSelector(isPlayingPrelude);
        const turn = useTypedSelector(state => state.common.turn);
        const generation = useTypedSelector(state => state.common.generation);
        const yourTurnToPlayPreludes =
            isPreludesEnabled && playing && turn === 1 && generation === 1;

        const yourMove =
            (isLoggedInPlayersTurn && isControlUnceded) ||
            isLoggedInPlayerInControl;
        const showWaitingForMessage =
            !yourMove && isActiveRound && !isLoggedInPlayerPassed;

        return (
            <TopBarBase
                ref={ref}
                borderWidth="2px"
                borderImageSlice="1"
                borderImageSource={color}
                borderStyle="hidden hidden solid hidden"
            >
                <PlayerIcon
                    size={18}
                    style={{
                        marginRight: '8px',
                        marginLeft: '8px',
                    }}
                    playerIndex={loggedInPlayer.index}
                    border={colors.LIGHT_2}
                />
                <Flex
                    alignItems="center"
                    padding="2px"
                    marginRight="4px"
                    flexWrap="wrap"
                >
                    <CorporationName>
                        {loggedInPlayer.corporation.name}
                    </CorporationName>
                    <Box display="inline" marginRight="4px">
                        <Box display="inline-block" marginRight="4px">
                            {isLoggedInPlayerPassed && 'You have passed.'}
                            {isEndOfGame && 'The game has ended.'}
                            {yourTurnToPlayPreludes && 'Playing preludes.'}
                            {!isActiveRound &&
                                !isEndOfGame &&
                                !isGreeneryPlacement &&
                                !hasPendingCardSelection &&
                                'Waiting to start generation.'}
                            {syncing && <em>Saving...</em>}
                            {!syncing && playing && !yourTurnToPlayPreludes && (
                                <Box
                                    display={
                                        showWaitingForMessage
                                            ? 'block'
                                            : 'inline'
                                    }
                                >
                                    Action {action} of 2
                                </Box>
                            )}
                            {showWaitingForMessage && (
                                <React.Fragment>
                                    <Box
                                        display="inline-block"
                                        style={{
                                            marginRight: 4,
                                            color: 'white',
                                        }}
                                    >
                                        Waiting for
                                    </Box>
                                    <PlayerCorpAndIcon
                                        player={currentPlayer}
                                        color="white"
                                        isInline={true}
                                    />
                                    <Box
                                        display="inline-block"
                                        style={{
                                            marginLeft: 0,
                                            color: 'white',
                                        }}
                                    >
                                        ...
                                    </Box>
                                </React.Fragment>
                            )}
                            {isLoggedInPlayersTurn && isGreeneryPlacement && (
                                <Box display="inline-block">
                                    {greeneryPlacementText}
                                </Box>
                            )}
                            {canSkip && (
                                <div className="ml-2 inline-flex">
                                    <Button
                                        onClick={() =>
                                            apiClient.skipActionAsync()
                                        }
                                    >
                                        Skip
                                    </Button>
                                </div>
                            )}
                            {canPass && (
                                <div className="ml-2 inline-flex">
                                    <Button
                                        onClick={() =>
                                            apiClient.passGenerationAsync()
                                        }
                                    >
                                        Pass
                                    </Button>
                                </div>
                            )}
                        </Box>
                    </Box>
                    {yourTurnMessage ? (
                        <Box color="#ddd">
                            {yourTurnMessage}
                            <Link href={yourTurnLink}>
                                <YourTurnLink href={yourTurnLink}>
                                    Click
                                </YourTurnLink>
                            </Link>
                        </Box>
                    ) : null}
                </Flex>
                <Flex marginLeft="auto">
                    <ActionLog />
                    <BlankButton onClick={() => router.push('/')}>
                        <Twemoji>🏠</Twemoji>
                    </BlankButton>
                </Flex>
            </TopBarBase>
        );
    }
);
