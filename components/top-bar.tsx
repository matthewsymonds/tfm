import {skipAction} from 'actions';
import {Square} from 'components/square';
import {GameStage} from 'constants/game';
import {AppContext} from 'context/app-context';
import ActiveSpinner from 'assets/animated-cog.svg';
import StaticSpinner from 'assets/static-cog.svg';
import {useRouter} from 'next/router';
import {useContext} from 'react';
import {useDispatch, useStore} from 'react-redux';
import {PlayerState, RootState, useTypedSelector} from 'reducer';
import styled from 'styled-components';
import {Flex, Box} from 'components/box';
import {colors} from 'components/ui';
import React from 'react';

const TopBarBase = styled.div`
    display: flex;
    width: 100%;
    justifycontent: space-between;
    fontsize: 13px;
    padding: 0 8px;
    color: #dddddd;
    background-color: ${colors.NAV_BG};
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
    margin: 8px 0 4px;
`;

type PlayerCorpAndColorProps = {
    player: PlayerState;
    isPassed: boolean;
    onSelectPlayer: () => void;
    isLoggedInPlayer: boolean;
    isActive: boolean;
    isSelected: boolean;
};

const HiddenInput = styled.input`
    display: none;
`;

const TabLabel = styled.label<{isSelected: boolean}>`
    margin-right: 12px;
    padding: 8px;
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
    font-size: 13px;
    font-weight: 600;
    color: ${colors.TEXT_DARK_1};
    cursor: pointer;

    background-color: ${colors.MAIN_BG};
    opacity: ${props => (props.isSelected ? 1 : 0.5)};
`;

const PlayerCorpAndColor = ({
    player,
    onSelectPlayer,
    isLoggedInPlayer,
    isSelected,
    isPassed,
    isActive,
}: PlayerCorpAndColorProps) => {
    const gameStage = useTypedSelector(state => state.common.gameStage);
    const isCorporationSelection = gameStage === GameStage.CORPORATION_SELECTION;

    const inputId = `tab-${player.username}`;
    let playerTabText = isCorporationSelection ? player.username : player.corporation.name;
    playerTabText += isLoggedInPlayer ? ' (you)' : '';

    return (
        <React.Fragment>
            <HiddenInput
                type="radio"
                name="players"
                id={inputId}
                checked={isSelected}
                onChange={onSelectPlayer}
            />
            <TabLabel htmlFor={inputId} isSelected={isSelected}>
                <Flex alignItems="center">
                    <Square playerIndex={player.index} shouldHideBorder={true} />
                    <Box marginLeft="4px" whiteSpace="nowrap" marginRight="4px">
                        {playerTabText}
                    </Box>
                    <img
                        className="inverted left-margin-3px"
                        height={16}
                        src={isActive ? ActiveSpinner : StaticSpinner}
                        alt={isActive ? 'active' : ''}
                    />
                </Flex>
            </TabLabel>
        </React.Fragment>
    );
};

const RoundText = styled.span`
    font-size: 13px;
`;

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
    const currentPlayerIndex = useTypedSelector(state => state.common.currentPlayerIndex);
    const gameStage = useTypedSelector(state => state?.common?.gameStage);

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
                        {allPlayers.map(player => (
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
                <RoundText>
                    Generation {generation}, Turn {turn}
                </RoundText>
                <ActionBarButton onClick={() => router.push('/')}>Home</ActionBarButton>
            </Flex>
        </TopBarBase>
    );
};
