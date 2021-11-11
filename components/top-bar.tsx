import {ActionLog} from 'components/action-log';
import {Box, Flex} from 'components/box';
import Button from 'components/controls/button';
import {PlayerCorpAndIcon, PlayerIcon} from 'components/icons/player';
import {colors} from 'components/ui';
import {CONVERSIONS} from 'constants/conversion';
import {GameStage} from 'constants/game';
import {Resource} from 'constants/resource-enum';
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import Link from 'next/link';
import {useRouter} from 'next/router';
import React, {forwardRef} from 'react';
import {useTypedSelector} from 'reducer';
import styled from 'styled-components';
import {BlankButton} from './blank-button';

const TopBarBase = styled(Box)`
    display: flex;
    width: 100%;
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

        const yourTurnGamesFiltered = yourTurnGames.filter(game => game !== currentGame);

        const gameStage = useTypedSelector(state => state.common.gameStage);

        const isActiveRound = gameStage === GameStage.ACTIVE_ROUND;
        const {draftPicks = [], possibleCards = []} = loggedInPlayer?.pendingCardSelection ?? {
            draftPicks: [],
            possibleCards: [],
        };
        const isPickingCards = (draftPicks?.length ?? 0) + (possibleCards?.length ?? 0) === 4;

        /**
         * State selectors
         */
        const currentPlayerIndex = useTypedSelector(state => state.common.currentPlayerIndex);
        const players = useTypedSelector(state => state.players);
        const syncing = useTypedSelector(state => state.syncing);

        /**
         * Derived state
         */
        const {action, index: loggedInPlayerIndex} = useTypedSelector(
            state => state.players[loggedInPlayer.index]
        );
        const isLoggedInPlayerInControl = useTypedSelector(
            state =>
                state.common.controllingPlayerIndex === loggedInPlayerIndex ||
                state.common.controllingPlayerIndex === undefined
        );
        const isDrafting = useTypedSelector(state => gameStage === GameStage.DRAFTING);
        const isBuyOrDiscard = useTypedSelector(state => gameStage === GameStage.BUY_OR_DISCARD);
        const isGreeneryPlacement = useTypedSelector(
            state => gameStage === GameStage.GREENERY_PLACEMENT
        );
        const isEndOfGame = useTypedSelector(state => gameStage === GameStage.END_OF_GAME);
        const hasPendingCardSelection = useTypedSelector(
            state => !!loggedInPlayer.pendingCardSelection
        );
        const currentPlayer = useTypedSelector(
            state => players[state.common.controllingPlayerIndex ?? currentPlayerIndex]
        );
        const isLoggedInPlayersTurn = currentPlayerIndex === loggedInPlayer.index;
        const isLoggedInPlayerPassed = useTypedSelector(
            state => loggedInPlayer.action === 0 && isActiveRound
        );

        const playing =
            loggedInPlayer.action > 0 &&
            isLoggedInPlayersTurn &&
            isLoggedInPlayerInControl &&
            isActiveRound;

        const topBarColor =
            isLoggedInPlayersTurn || hasPendingCardSelection || isLoggedInPlayerInControl
                ? colors.NAV_BG_YOUR_TURN
                : isLoggedInPlayerPassed
                ? colors.NAV_BG_PASSED
                : colors.NAV_BG_WAITING;

        const onlyOnePlayer = useTypedSelector(state => state.players.length === 1);
        const yourTurnMessage =
            yourTurnGamesFiltered.length > 0 && (!playing || onlyOnePlayer) ? (
                <Box marginRight="8px" display="inline-block" fontStyle="italic">
                    It is your turn in {yourTurnGamesFiltered.length} game
                    {yourTurnGamesFiltered.length === 1 ? '' : 's'}:
                </Box>
            ) : null;

        const yourTurnLink = `/games/${yourTurnGamesFiltered[0]}`;

        const actionGuard = useActionGuard();

        const color = `linear-gradient(to right, ${topBarColor} 0px, rgba(255,255,255,0) 250px);`;

        const greeneryPlacementText = actionGuard.canDoConversion(CONVERSIONS[Resource.PLANT])[0]
            ? 'You may place a greenery.'
            : 'Cannot place any more greeneries.';

        const canSkip = useTypedSelector(state => actionGuard.canSkipAction()[0]);
        const canPass = useTypedSelector(state => actionGuard.canPassGeneration()[0]);

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
                        marginTop: '13px',
                        marginBottom: 'auto',
                    }}
                    playerIndex={loggedInPlayer.index}
                    border={colors.LIGHT_2}
                />
                <Flex alignItems="center" padding="2px" marginRight="4px" flexWrap="wrap">
                    <CorporationName>{loggedInPlayer.corporation.name}</CorporationName>
                    <Box display="inline" marginRight="4px">
                        {isLoggedInPlayerPassed && 'You have passed.'}
                        {isEndOfGame && 'The game has ended.'}
                        {!isActiveRound &&
                            !isEndOfGame &&
                            !isGreeneryPlacement &&
                            !hasPendingCardSelection &&
                            'Waiting to start generation.'}
                        {syncing && <em>Saving...</em>}
                        {(isBuyOrDiscard || isDrafting) && hasPendingCardSelection && !syncing && (
                            <div>Please choose your cards.</div>
                        )}
                        {!syncing && playing && <>Action {action} of 2</>}
                        {(!isLoggedInPlayersTurn || !isLoggedInPlayerInControl) &&
                            isActiveRound &&
                            !isLoggedInPlayerPassed && (
                                <React.Fragment>
                                    <Box
                                        display="inline-block"
                                        style={{marginRight: 4, color: 'white'}}
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
                                        style={{marginLeft: 0, color: 'white'}}
                                    >
                                        ...
                                    </Box>
                                </React.Fragment>
                            )}
                        {isLoggedInPlayersTurn && isGreeneryPlacement && (
                            <Box display="inline-block">{greeneryPlacementText}</Box>
                        )}
                        {canSkip && (
                            <Button onClick={() => apiClient.skipActionAsync()} margin="0 0 0 8px">
                                Skip
                            </Button>
                        )}
                        {canPass && (
                            <Button
                                onClick={() => apiClient.passGenerationAsync()}
                                margin="0 0 0 8px"
                            >
                                Pass
                            </Button>
                        )}
                    </Box>
                    {yourTurnMessage ? (
                        <Box color="#ddd">
                            {yourTurnMessage}
                            <Link href={yourTurnLink}>
                                <YourTurnLink href={yourTurnLink}>Click</YourTurnLink>
                            </Link>
                        </Box>
                    ) : null}
                </Flex>
                <Flex marginLeft="auto">
                    <ActionLog />
                    <BlankButton onClick={() => router.push('/')}>🏠</BlankButton>
                </Flex>
            </TopBarBase>
        );
    }
);
