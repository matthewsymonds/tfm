import {skipAction} from 'actions';
import {Square} from 'components/square';
import {GameStage} from 'constants/game';
import {AppContext} from 'context/app-context';
import {Pane} from 'evergreen-ui';
import {useRouter} from 'next/router';
import {useContext} from 'react';
import {useDispatch, useStore} from 'react-redux';
import {PlayerState, RootState, useTypedSelector} from 'reducer';
import styled, {keyframes} from 'styled-components';
import {Flex} from 'components/box';
import {colors} from 'components/ui';

const TopBarBase = styled.div`
    display: flex;
    width: 100%;
    justifycontent: space-between;
    fontsize: 13px;
    padding: 8px;
    color: #dddddd;
    background-color: ${colors.DARK_2};
`;

const ActionBarButton = styled.button`
    display: inline;
    margin-left: 8px;
    width: fit-content;
    min-width: 0px;
    padding: 6px 8px;
`;

const PlayerGroupHeader = styled.span`
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 600;
    font-size: 10px;
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

const PlayerCorpAndColorBase = styled.button<{
    isPassed: boolean;
    isActive: boolean;
    isSelected: boolean;
}>`
    margin-right: 12px;
    display: flex;
    align-items: center;
    padding: 8px;
    border-radius: 3px;
    font-size: 12px;
    background-color: unset;
    color: unset;
    border: 1px solid rgba(0, 0, 0, 0);
    opacity: ${props => (props.isPassed ? 0.5 : 1)};
    font-style: ${props => (props.isPassed ? 'italic' : '')};

    &:focus,
    &:active {
        background-color: background: rgba(255, 255, 255, 0.08);
    }

    &:hover:not([disabled]) {
        background-color: rgba(255, 255, 255, 0.08);
    }

    &:active {
        border-color: #bbbbbb;
        color: white;
        background: rgba(255, 255, 255, 0.08);
    }

    border-color: ${props => (props.isSelected ? '#bbbbbb' : '')};
    color: ${props => (props.isSelected ? 'white' : 'unset')};
    background: ${props => (props.isSelected ? 'rgba(255, 255, 255, 0.08)' : 'unset')};
`;

type PlayerCorpAndColorProps = {
    player: PlayerState;
    isPassed: boolean;
    onSelectPlayer: () => void;
    isLoggedInPlayer: boolean;
    isActive: boolean;
    isSelected: boolean;
};

const PlayerCorpAndColor = ({
    player,
    onSelectPlayer,
    isPassed,
    isLoggedInPlayer,
    isActive,
    isSelected,
}: PlayerCorpAndColorProps) => {
    const gameStage = useTypedSelector(state => state.common.gameStage);
    const isCorporationSelection = gameStage === GameStage.CORPORATION_SELECTION;
    return (
        <PlayerCorpAndColorBase
            isActive={isActive}
            isPassed={isPassed}
            isSelected={isSelected}
            onClick={onSelectPlayer}
        >
            <Square playerIndex={player.index} shouldHideBorder={true} />
            <Pane marginLeft="4px" whiteSpace="nowrap">
                {isCorporationSelection ? player.username : player.corporation.name}
                {isLoggedInPlayer && ' (You)'}
            </Pane>
        </PlayerCorpAndColorBase>
    );
};

type TopBarProps = {
    isPlayerMakingDecision: boolean;
    selectedPlayerIndex: number;
    setSelectedPlayerIndex: (playerIndex: number) => void;
};

export const TopBar = ({
    isPlayerMakingDecision,
    selectedPlayerIndex,
    setSelectedPlayerIndex,
}: TopBarProps) => {
    /**
     * Hooks
     */
    const store = useStore<RootState>();
    const state = store.getState();
    const context = useContext(AppContext);
    const dispatch = useDispatch();
    const router = useRouter();

    /**
     * State selectors
     */
    const generation = useTypedSelector(state => state.common.generation);
    const turn = useTypedSelector(state => state.common.turn);
    const allPlayers = useTypedSelector(state => state.players ?? []);
    const playerIndexOrderForGeneration = useTypedSelector(
        state => state.common.playerIndexOrderForGeneration ?? []
    );
    const currentPlayerIndex = useTypedSelector(state => state.common.currentPlayerIndex);
    const gameStage = useTypedSelector(state => state?.common?.gameStage);
    const sortedPlayers = [...allPlayers].sort(
        (a, b) =>
            playerIndexOrderForGeneration.indexOf(a.index) -
            playerIndexOrderForGeneration.indexOf(b.index)
    );

    /**
     * Derived state
     */
    const loggedInPlayer = context.getLoggedInPlayer(state);
    const {action, index: loggedInPlayerIndex} = loggedInPlayer;
    const isLoggedInPlayersTurn = currentPlayerIndex === loggedInPlayerIndex;
    const isActiveRound = gameStage === GameStage.ACTIVE_ROUND;

    return (
        <TopBarBase>
            <Flex alignItems="center" justifyContent="flex-start" flexBasis="40%">
                <Flex flexDirection="column">
                    <PlayerGroupHeader>Players</PlayerGroupHeader>
                    <Flex>
                        {sortedPlayers.map(player => (
                            <PlayerCorpAndColor
                                key={player.index}
                                player={player}
                                isPassed={player.action === 0}
                                isActive={player.index === currentPlayerIndex && isActiveRound}
                                isLoggedInPlayer={player.index === loggedInPlayerIndex}
                                isSelected={player.index === selectedPlayerIndex}
                                onSelectPlayer={() => setSelectedPlayerIndex(player.index)}
                            />
                        ))}
                    </Flex>
                </Flex>
            </Flex>
            <Flex alignItems="center" justifyContent="center" flexBasis="20%">
                {loggedInPlayer.action === 0 && <span>You have passed.</span>}
                {!isActiveRound && <span>Waiting to start generation.</span>}
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
            <Flex alignItems="center" justifyContent="flex-end" flexBasis="40%">
                Generation {generation}, Turn {turn}
                <ActionBarButton onClick={() => router.push('/')}>Home</ActionBarButton>
            </Flex>
        </TopBarBase>
    );
};
