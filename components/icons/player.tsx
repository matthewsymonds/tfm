import {Flex} from 'components/box';
import {PLAYER_COLORS} from 'constants/game';
import {PlayerState, useTypedSelector} from 'reducer';
import {getHasPlayerPassed} from 'selectors/get-has-player-passed';
import styled from 'styled-components';

const PlayerIconBase = styled.div<{size: number; color: string; passed: boolean}>`
    width: ${props => props.size}px;
    height: ${props => props.size}px;
    background-color: ${props => props.color};
    opacity: ${props => (props.passed ? 0.5 : 1)};
    border: 1px solid white;
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const PlayerIcon = ({playerIndex, size}: {playerIndex: number; size: number}) => {
    const color = PLAYER_COLORS[playerIndex];
    const passed = useTypedSelector(state => getHasPlayerPassed(playerIndex, state));
    return <PlayerIconBase size={size} color={color} passed={passed} />;
};

export const PlayerCorpAndIcon = ({player}: {player: PlayerState}) => {
    return (
        <Flex alignItems="center" justifyContent="center">
            <PlayerIcon playerIndex={player.index} size={12} />
            <span style={{marginLeft: 4, fontWeight: 600, color: 'white'}}>
                {player.corporation?.name ?? player.username}
            </span>
        </Flex>
    );
};
