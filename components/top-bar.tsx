import {ActionLog} from 'components/action-log';
import {Box, Flex} from 'components/box';
import Button from 'components/controls/button';
import {PlayerCorpAndIcon, PlayerIcon} from 'components/icons/player';
import {colors} from 'components/ui';
import {CONVERSIONS} from 'constants/conversion';
import {GameStage} from 'constants/game';
import {Resource} from 'constants/resource';
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import {useRouter} from 'next/router';
import React, {forwardRef} from 'react';
import {PlayerState, useTypedSelector} from 'reducer';
import styled from 'styled-components';
import {BlankButton} from './blank-button';

const TopBarBase = styled(Box)`
    display: flex;
    width: 100%;
    justify-content: flex-start;
    align-items: center;
    color: #ddd;
`;

const CorporationName = styled(Flex)`
    margin: 0;
    font-size: 36px;
    margin-right: 8px;
    font-family: 'Ubuntu Condensed', sans-serif;
    font-weight: bold;
`;

type TopBarProps = {
    loggedInPlayer: PlayerState;
};

export const TopBar = forwardRef<HTMLDivElement, TopBarProps>(
    ({loggedInPlayer}: TopBarProps, ref) => {
        const router = useRouter();

        /**
         * State selectors
         */
        const currentPlayerIndex = useTypedSelector(state => state.common.currentPlayerIndex);
        const gameStage = useTypedSelector(state => state?.common?.gameStage);
        const players = useTypedSelector(state => state?.players);
        const syncing = useTypedSelector(state => state.syncing);

        /**
         * Derived state
         */
        const {action, index: loggedInPlayerIndex} = loggedInPlayer;
        const isLoggedInPlayersTurn = currentPlayerIndex === loggedInPlayerIndex;
        const isActiveRound = gameStage === GameStage.ACTIVE_ROUND;
        const isDrafting = gameStage === GameStage.DRAFTING;
        const isBuyOrDiscard = gameStage === GameStage.BUY_OR_DISCARD;
        const isGreeneryPlacement = gameStage === GameStage.GREENERY_PLACEMENT;
        const isEndOfGame = gameStage === GameStage.END_OF_GAME;
        const hasPendingCardSelection = !!loggedInPlayer.pendingCardSelection;
        const currentPlayer = players[currentPlayerIndex];
        const isLoggedInPlayerPassed = loggedInPlayer.action === 0 && isActiveRound;

        const topBarColor =
            isLoggedInPlayersTurn || hasPendingCardSelection
                ? colors.NAV_BG_YOUR_TURN
                : isLoggedInPlayerPassed
                ? colors.NAV_BG_PASSED
                : colors.NAV_BG_WAITING;

        const apiClient = useApiClient();

        const actionGuard = useActionGuard();

        const color = `linear-gradient(to right, ${topBarColor}, rgba(255,255,255,0), rgba(255,255,255,0));`;

        const greeneryPlacementText = actionGuard.canDoConversion(CONVERSIONS[Resource.PLANT])[0]
            ? 'You may place a greenery.'
            : 'Cannot place any more greeneries.';

        return (
            <TopBarBase
                ref={ref}
                borderWidth="2px"
                borderImageSlice="1"
                borderImageSource={color}
                borderStyle="hidden hidden solid hidden"
            >
                <Flex
                    alignItems="flex-end"
                    flexShrink="0"
                    padding="2px"
                    marginRight="4px"
                    overflow="hidden"
                >
                    <CorporationName>
                        <PlayerIcon
                            size={18}
                            style={{
                                marginRight: '8px',
                                marginLeft: '6px',
                                marginTop: 'auto',
                                marginBottom: 'auto',
                            }}
                            playerIndex={loggedInPlayer.index}
                        />
                        {loggedInPlayer.corporation.name}
                    </CorporationName>
                </Flex>
                <div className="ellipsis">
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
                    {!syncing &&
                        loggedInPlayer.action > 0 &&
                        isLoggedInPlayersTurn &&
                        isActiveRound &&
                        <>Action {action} of 2</>}
                    {!isLoggedInPlayersTurn && isActiveRound && !isLoggedInPlayerPassed && (
                        <React.Fragment>
                            <div style={{marginRight: 4, color: 'white'}}>Waiting on</div>
                            <PlayerCorpAndIcon
                                player={currentPlayer}
                                color="white"
                                isInline={true}
                            />
                            <div style={{marginLeft: 0, color: 'white'}}>...</div>
                        </React.Fragment>
                    )}
                    {isLoggedInPlayersTurn && isGreeneryPlacement && (
                        <div>{greeneryPlacementText}</div>
                    )}
                    {actionGuard.canSkipAction()[0] && (isGreeneryPlacement || isActiveRound) && (
                        <Button onClick={() => apiClient.skipActionAsync()} margin="0 0 0 8px">
                            {isGreeneryPlacement ? 'Pass' : action === 2 ? 'Skip' : 'Pass'}
                        </Button>
                    )}
                </div>
                <Flex marginLeft="auto">
                    <ActionLog />
                    <BlankButton onClick={() => router.push('/')}>🏠</BlankButton>
                </Flex>
            </TopBarBase>
        );
    }
);
