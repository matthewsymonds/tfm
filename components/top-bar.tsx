import {skipAction} from 'actions';
import {Flex} from 'components/box';
import {colors} from 'components/ui';
import {GameStage} from 'constants/game';
import {AppContext} from 'context/app-context';
import {useRouter} from 'next/router';
import React, {useContext} from 'react';
import {useDispatch, useStore} from 'react-redux';
import {GameState, useTypedSelector} from 'reducer';
import styled from 'styled-components';

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

const ActionBarButton = styled.button`
    display: inline;
    margin-left: 8px;
    min-width: 0px;
    padding: 6px 8px;
`;

const RoundText = styled.span`
    font-size: 13px;
`;

type TopBarProps = {
    isPlayerMakingDecision: boolean;
};

export const TopBar = ({isPlayerMakingDecision}: TopBarProps) => {
    /**
     * Hooks
     */
    const store = useStore<GameState>();
    const state = store.getState();
    const context = useContext(AppContext);
    const dispatch = useDispatch();
    const router = useRouter();

    /**
     * State selectors
     */
    const generation = useTypedSelector(state => state.common.generation);
    const turn = useTypedSelector(state => state.common.turn);
    const currentPlayerIndex = useTypedSelector(state => state.common.currentPlayerIndex);
    const gameStage = useTypedSelector(state => state?.common?.gameStage);

    /**
     * Derived state
     */
    const loggedInPlayer = context.getLoggedInPlayer(state);
    const {action, index: loggedInPlayerIndex} = loggedInPlayer;
    const isLoggedInPlayersTurn = currentPlayerIndex === loggedInPlayerIndex;
    const isActiveRound = gameStage === GameStage.ACTIVE_ROUND;
    const isCorporationSelection = gameStage === GameStage.CORPORATION_SELECTION;
    const isBuyOrDiscard = gameStage === GameStage.BUY_OR_DISCARD;
    const isBuyingCards = loggedInPlayer.buyCards;

    const isLoggedInPlayerPassed = loggedInPlayer.action === 0 && isActiveRound;

    const topBarColor =
        isLoggedInPlayersTurn || isBuyingCards
            ? colors.NAV_BG_YOUR_TURN
            : isLoggedInPlayerPassed
            ? colors.NAV_BG_PASSED
            : colors.NAV_BG_WAITING;

    return (
        <TopBarBase color={topBarColor}>
            <Flex alignItems="center" justifyContent="center">
                {isLoggedInPlayerPassed && <span>You have passed.</span>}
                {!isActiveRound && !isBuyingCards && <span>Waiting to start generation.</span>}
                {isCorporationSelection && isBuyingCards && (
                    <span>Please choose your corporation and cards.</span>
                )}
                {isBuyOrDiscard && isBuyingCards && <span>Please choose your cards.</span>}
                {loggedInPlayer.action > 0 && isLoggedInPlayersTurn && isActiveRound && (
                    <span>Action {action} of 2</span>
                )}
                {loggedInPlayer.action > 0 &&
                    isLoggedInPlayersTurn &&
                    isActiveRound &&
                    !(context.shouldDisableUI(state) || isPlayerMakingDecision) && (
                        <ActionBarButton onClick={() => dispatch(skipAction(loggedInPlayerIndex))}>
                            {action === 2 ? 'End turn' : 'Pass'}
                        </ActionBarButton>
                    )}
            </Flex>
            <Flex alignItems="center" justifyContent="flex-end">
                <RoundText>
                    Generation {generation}, Turn {turn}
                </RoundText>
                <ActionBarButton onClick={() => router.push('/')}>Home</ActionBarButton>
            </Flex>
        </TopBarBase>
    );
};
