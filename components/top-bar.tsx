import {ApiClient} from 'api-client';
import {ActionGuard} from 'client-server-shared/action-guard';
import {Flex} from 'components/box';
import {PlayerCorpAndIcon} from 'components/icons/player';
import {colors} from 'components/ui';
import {CONVERSIONS} from 'constants/conversion';
import {GameStage} from 'constants/game';
import {Resource} from 'constants/resource';
import {AppContext} from 'context/app-context';
import {useRouter} from 'next/router';
import React, {useContext} from 'react';
import {useDispatch} from 'react-redux';
import {useTypedSelector} from 'reducer';
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
    const state = useTypedSelector(state => state);
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
    const players = useTypedSelector(state => state?.players);

    /**
     * Derived state
     */
    const loggedInPlayer = context.getLoggedInPlayer(state);
    const {action, index: loggedInPlayerIndex} = loggedInPlayer;
    const isLoggedInPlayersTurn = currentPlayerIndex === loggedInPlayerIndex;
    const isActiveRound = gameStage === GameStage.ACTIVE_ROUND;
    const isCorporationSelection = gameStage === GameStage.CORPORATION_SELECTION;
    const isBuyOrDiscard = gameStage === GameStage.BUY_OR_DISCARD;
    const isGreeneryPlacement = gameStage === GameStage.GREENERY_PLACEMENT;
    const isBuyingCards = loggedInPlayer.buyCards;
    const currentPlayer = players[currentPlayerIndex];
    const isLoggedInPlayerPassed = loggedInPlayer.action === 0 && isActiveRound;

    const topBarColor =
        isLoggedInPlayersTurn || isBuyingCards
            ? colors.NAV_BG_YOUR_TURN
            : isLoggedInPlayerPassed
            ? colors.NAV_BG_PASSED
            : colors.NAV_BG_WAITING;

    const apiClient = new ApiClient(dispatch);

    const roundText = isGreeneryPlacement
        ? 'Greenery Placement'
        : `Generation ${generation}, Turn ${turn}`;

    const actionGuard = new ActionGuard(state, loggedInPlayer.username);

    const greeneryPlacementText = actionGuard.canDoConversion(CONVERSIONS[Resource.PLANT])[0]
        ? 'You may place a greenery.'
        : 'Cannot place any more greeneries.';

    return (
        <TopBarBase color={topBarColor}>
            <Flex alignItems="center" justifyContent="center">
                {isLoggedInPlayerPassed && <span>You have passed.</span>}
                {!isActiveRound && !isGreeneryPlacement && !isBuyingCards && (
                    <span>Waiting to start generation.</span>
                )}
                {isCorporationSelection && isBuyingCards && (
                    <span>Please choose your corporation and cards.</span>
                )}
                {isBuyOrDiscard && isBuyingCards && <span>Please choose your cards.</span>}
                {loggedInPlayer.action > 0 && isLoggedInPlayersTurn && isActiveRound && (
                    <span>Action {action} of 2</span>
                )}
                {!isLoggedInPlayersTurn && isActiveRound && !isLoggedInPlayerPassed && (
                    <React.Fragment>
                        <span style={{marginRight: 4}}>Waiting on </span>
                        <PlayerCorpAndIcon player={currentPlayer} />
                        <span style={{marginLeft: 4}}> to take their turn...</span>
                    </React.Fragment>
                )}
                {isLoggedInPlayersTurn && isGreeneryPlacement && (
                    <span>{greeneryPlacementText}</span>
                )}
                {loggedInPlayer.action > 0 &&
                    isLoggedInPlayersTurn &&
                    isActiveRound &&
                    !(actionGuard.shouldDisableUI() || isPlayerMakingDecision) && (
                        <ActionBarButton onClick={() => apiClient.skipActionAsync()}>
                            {action === 2 ? 'End turn' : 'Pass'}
                        </ActionBarButton>
                    )}
                {isLoggedInPlayersTurn &&
                    isGreeneryPlacement &&
                    !(
                        actionGuard.shouldDisableValidGreeneryPlacementUI() ||
                        isPlayerMakingDecision
                    ) && (
                        <ActionBarButton onClick={() => apiClient.skipActionAsync()}>
                            End greenery placement
                        </ActionBarButton>
                    )}
            </Flex>
            <Flex alignItems="center" justifyContent="flex-end">
                <RoundText>{roundText}</RoundText>
                <ActionBarButton onClick={() => router.push('/')}>Home</ActionBarButton>
            </Flex>
        </TopBarBase>
    );
};
