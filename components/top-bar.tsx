import {ActionBar, ActionBarRow} from './action-bar';
import styled, {keyframes, css} from 'styled-components';
import {getWaitingMessage} from 'selectors/get-waiting-message';
import {PlayerState, RootState, useTypedSelector} from 'reducer';
import {useStore, useDispatch} from 'react-redux';
import {AppContext} from 'context/app-context';
import {useContext} from 'react';
import {useRouter} from 'next/router';
import {skipAction} from 'actions';
import {Pane, Text} from 'evergreen-ui';
import {Square} from 'components/square';

const ActionBarButton = styled.button`
    display: inline;
    margin-left: 4px;
    width: fit-content;
    min-width: 0px;
    padding-left: 8px;
    padding-right: 8px;
    padding-top: 6px;
    padding-bottom: 6px;
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
    border-bottom: 2px solid rgba(0, 0, 0, 0);
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
    isActive,
}: {
    player: PlayerState;
    isPassed: boolean;
    isActive?: boolean;
}) => {
    return (
        <PlayerCorpAndColorBase isActive={isActive} isPassed={isPassed}>
            <Square playerIndex={player.index} shouldHideBorder={true} />
            <Pane marginLeft="4px">{player.corporation?.name ?? player.username}</Pane>
        </PlayerCorpAndColorBase>
    );
};

type TopBarProps = {
    player: PlayerState;
    isPlayerMakingDecision: boolean;
};

export const TopBar = ({player, isPlayerMakingDecision}: TopBarProps) => {
    const store = useStore<RootState>();
    const state = store.getState();
    const context = useContext(AppContext);
    const dispatch = useDispatch();
    const router = useRouter();

    const {action, index: playerIndex} = player;
    const waitingMessage = getWaitingMessage(playerIndex);
    const generation = useTypedSelector(state => state.common.generation);
    const currentPlayerIndex = useTypedSelector(state => state.common.currentPlayerIndex);
    const allPlayers = useTypedSelector(state => state.players ?? []);
    const turn = useTypedSelector(state => state.common.turn);

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
                    <Info>
                        Playing as {player.corporation?.name}. {!action && 'You have passed'}
                        {action ? waitingMessage || `Action ${action} of 2` : null}
                        {action && !(context.shouldDisableUI(state) || isPlayerMakingDecision) ? (
                            <ActionBarButton onClick={() => dispatch(skipAction(playerIndex))}>
                                {action === 2 ? 'Skip 2nd action' : 'Pass'}
                            </ActionBarButton>
                        ) : null}
                    </Info>
                    <Info>
                        <Pane display="flex" marginY="6px" flexDirection="column">
                            <PlayerGroupHeader>Players</PlayerGroupHeader>
                            <Pane display="flex">
                                {allPlayers.map(player => (
                                    <PlayerCorpAndColor
                                        key={player.index}
                                        player={player}
                                        isPassed={player.action === 0}
                                        isActive={player.index === currentPlayerIndex}
                                    />
                                ))}
                            </Pane>
                        </Pane>
                    </Info>
                    <Info>
                        Gen {generation}, Turn {turn}
                        <ActionBarButton onClick={() => router.push('/')}>Home</ActionBarButton>
                    </Info>
                </Pane>
            </ActionBarRow>
        </ActionBar>
    );
};
