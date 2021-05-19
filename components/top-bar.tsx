import {ActionLog} from 'components/action-log';
import {Flex} from 'components/box';
import Button from 'components/controls/button';
import {PlayerCorpAndIcon} from 'components/icons/player';
import {colors} from 'components/ui';
import {CONVERSIONS} from 'constants/conversion';
import {GameStage} from 'constants/game';
import {Resource} from 'constants/resource';
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import {useRouter} from 'next/router';
import React from 'react';
import {PlayerState, useTypedSelector} from 'reducer';
import styled from 'styled-components';
import {PlayersOrder} from './players-order';

const TopBarBase = styled.div`
    display: flex;
    width: 100%;
    height: 36px;
    justify-content: space-between;
    font-size: 13px;
    padding: 0 8px;
    color: #dddddd;
    background-color: ${props => props.color};
`;

type TopBarProps = {
    loggedInPlayer: PlayerState;
};

export const TopBar = ({loggedInPlayer}: TopBarProps) => {
    const router = useRouter();

    /**
     * State selectors
     */
    const generation = useTypedSelector(state => state.common.generation);
    const turn = useTypedSelector(state => state.common.turn);
    const currentPlayerIndex = useTypedSelector(state => state.common.currentPlayerIndex);
    const gameStage = useTypedSelector(state => state?.common?.gameStage);
    const players = useTypedSelector(state => state?.players);

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

    const roundText = isGreeneryPlacement
        ? 'Greenery Placement'
        : `Gen ${generation}, Turn ${turn}`;

    const actionGuard = useActionGuard();

    const greeneryPlacementText = actionGuard.canDoConversion(CONVERSIONS[Resource.PLANT])[0]
        ? 'You may place a greenery.'
        : 'Cannot place any more greeneries.';

    return (
        <TopBarBase color={topBarColor}>
            <Flex alignItems="center" justifyContent="center">
                <Flex alignItems="center" marginRight="8px">
                    <PlayerCorpAndIcon player={loggedInPlayer} color="white" />
                </Flex>
                {isLoggedInPlayerPassed && <span>You have passed.</span>}
                {isEndOfGame && <span>The game has ended.</span>}
                {!isActiveRound &&
                    !isEndOfGame &&
                    !isGreeneryPlacement &&
                    !hasPendingCardSelection && <span>Waiting to start generation.</span>}

                {(isBuyOrDiscard || isDrafting) && hasPendingCardSelection && (
                    <span>Please choose your cards.</span>
                )}
                {loggedInPlayer.action > 0 && isLoggedInPlayersTurn && isActiveRound && (
                    <span>Action {action} of 2</span>
                )}
                {!isLoggedInPlayersTurn && isActiveRound && !isLoggedInPlayerPassed && (
                    <React.Fragment>
                        <span style={{marginRight: 4}}>Waiting on </span>
                        <PlayerCorpAndIcon player={currentPlayer} color="white" />
                        <span style={{marginLeft: 4}}> to take their turn...</span>
                    </React.Fragment>
                )}
                {isLoggedInPlayersTurn && isGreeneryPlacement && (
                    <span>{greeneryPlacementText}</span>
                )}
                {actionGuard.canSkipAction()[0] && (isGreeneryPlacement || isActiveRound) && (
                    <Button onClick={() => apiClient.skipActionAsync()} margin="0 0 0 8px">
                        {isGreeneryPlacement
                            ? 'End greenery placement'
                            : action === 2
                            ? 'End turn'
                            : 'Pass'}
                    </Button>
                )}
            </Flex>
            <Flex alignItems="center" justifyContent="flex-end">
                <ActionLog />
                <PlayersOrder />
                <span className="ellipsis">{roundText}</span>
                <Button onClick={() => router.push('/')} margin="0 0 0 4px">
                    Home
                </Button>
            </Flex>
        </TopBarBase>
    );
};
