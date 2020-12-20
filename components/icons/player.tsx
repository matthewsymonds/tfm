import {PLAYER_COLORS} from 'constants/game';
import styled from 'styled-components';
import {PlayerState} from 'reducer';
import {Flex} from 'components/box';

const PlayerIconBase = styled.div<{size: number; color: string}>`
    width: ${props => props.size}px;
    height: ${props => props.size}px;
    background-color: ${props => props.color};
    border: 1px solid white;
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const PlayerIcon = ({playerIndex, size}: {playerIndex: number; size: number}) => {
    const color = PLAYER_COLORS[playerIndex];
    return <PlayerIconBase size={size} color={color} />;
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
