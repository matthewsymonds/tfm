import {skipAction} from 'actions';
import {Square} from 'components/square';
import {GameStage} from 'constants/game';
import {AppContext} from 'context/app-context';
import {Pane} from 'evergreen-ui';
import {useRouter} from 'next/router';
import {useContext} from 'react';
import {useDispatch, useStore} from 'react-redux';
import {PlayerState, RootState, useTypedSelector} from 'reducer';
import styled, {css, keyframes} from 'styled-components';
import {ActionBar, ActionBarRow} from './action-bar';
import {Flex} from 'components/box';

const ActionBarButton = styled.button`
    display: inline;
    margin-left: 8px;
    width: fit-content;
    min-width: 0px;
    padding: 6px 8px;
`;

const Info = styled.div`
    font-size: 12px;
    display: flex;
    align-items: center;
    margin: 0 8px;
`;

const PlayerGroupHeader = styled.span`
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 600;
    font-size: 10px;
    color: black;
    opacity: 0.5;
    margin-bottom: 4px;
`;

const pulseBorder = keyframes`
    0% {
        border-color: rgba(0,0,0,0.2);
    }

    50% {
      border-color: rgba(0,0,0,0.8);
    }

    100% {
        border-color: rgba(0,0,0,0.2);
    }
`;

const PlayerCorpAndColorBase = styled.div<{isPassed: boolean; isActive?: boolean}>`
    margin-right: 12px;
    display: flex;
    align-items: center;
    padding-bottom: 2px;
    border-bottom: 4px solid rgba(0, 0, 0, 0);
    opacity: ${props => (props.isPassed ? 0.5 : 1)};
    font-style: ${props => (props.isPassed ? 'italic' : '')};
    ${props =>
        props.isActive
            ? css`
                  animation: ${pulseBorder} 2s linear infinite;
              `
            : ''};
`;

const PlayerCorpAndColor = ({
    player,
    isPassed,
    isLoggedInPlayer,
    isActive,
}: {
    player: PlayerState;
    isPassed: boolean;
    isLoggedInPlayer: boolean;
    isActive: boolean;
}) => {
    const gameStage = useTypedSelector(state => state.common.gameStage);
    const isCorporationSelection = gameStage === GameStage.CORPORATION_SELECTION;
    return (
        <PlayerCorpAndColorBase isActive={isActive} isPassed={isPassed}>
            <Square playerIndex={player.index} shouldHideBorder={true} />
            <Pane marginLeft="4px" whiteSpace="nowrap">
                {isCorporationSelection ? player.username : player.corporation.name}
                {isLoggedInPlayer && ' (You)'}
            </Pane>
        </PlayerCorpAndColorBase>
    );
};

type TopBarProps = {
    loggedInPlayer: PlayerState;
    isPlayerMakingDecision: boolean;
};

export const TopBar = ({loggedInPlayer, isPlayerMakingDecision}: TopBarProps) => {
    const store = useStore<RootState>();
    const state = store.getState();
    const context = useContext(AppContext);
    const dispatch = useDispatch();
    const router = useRouter();

    const {action, index: loggedInPlayerIndex} = loggedInPlayer;
    const generation = useTypedSelector(state => state.common.generation);
    const turn = useTypedSelector(state => state.common.turn);
    const allPlayers = useTypedSelector(state => state.players ?? []);
    const currentPlayerIndex = useTypedSelector(state => state.common.currentPlayerIndex);
    const isLoggedInPlayersTurn = currentPlayerIndex === loggedInPlayerIndex;

    return (
        <ActionBar>
            <ActionBarRow>
                <Pane
                    display="flex"
                    width="100%"
                    justifyContent="space-between"
                    fontSize="12px"
                    marginX="8px"
                >
                    <Flex alignItems="center" justifyContent="flex-start" flexBasis="40%">
                        <Pane
                            display="flex"
                            marginY="8px"
                            marginBottom="4px"
                            flexDirection="column"
                        >
                            <PlayerGroupHeader>Players</PlayerGroupHeader>
                            <Pane display="flex">
                                {allPlayers.map(player => (
                                    <PlayerCorpAndColor
                                        key={player.index}
                                        player={player}
                                        isPassed={player.action === 0}
                                        isActive={player.index === currentPlayerIndex}
                                        isLoggedInPlayer={player.index === loggedInPlayerIndex}
                                    />
                                ))}
                            </Pane>
                        </Pane>
                    </Flex>
                    <Flex alignItems="center" justifyContent="center" flexBasis="20%">
                        {loggedInPlayer.action === 0 && <span>You have passed</span>}
                        {loggedInPlayer.action > 0 && isLoggedInPlayersTurn && (
                            <span>Action {action} of 2</span>
                        )}
                        {loggedInPlayer.action > 0 &&
                            isLoggedInPlayersTurn &&
                            !(context.shouldDisableUI(state) || isPlayerMakingDecision) && (
                                <ActionBarButton
                                    onClick={() => dispatch(skipAction(loggedInPlayerIndex))}
                                >
                                    {action === 2 ? 'End turn' : 'Pass'}
                                </ActionBarButton>
                            )}
                    </Flex>
                    <Flex alignItems="center" justifyContent="flex-end" flexBasis="40%">
                        Generation {generation}, Turn {turn}
                        <ActionBarButton onClick={() => router.push('/')}>Home</ActionBarButton>
                    </Flex>
                </Pane>
            </ActionBarRow>
        </ActionBar>
    );
};
