import {Flex} from 'components/box';
import {colors} from 'components/ui';
import {PLAYER_COLORS} from 'constants/game';
import {PlayerState, useTypedSelector} from 'reducer';
import {getHasPlayerPassed} from 'selectors/get-has-player-passed';
import styled from 'styled-components';

const PlayerIconBase = styled.div<{size: number; color: string; passed: boolean; border?: string}>`
    width: ${props => props.size}px;
    height: ${props => props.size}px;
    background-color: ${props => props.color};
    opacity: ${props => (props.passed ? 0.5 : 1)};
    border: 1px solid ${props => props.border || colors.LIGHT_1};
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;

export const PlayerIcon = ({
    playerIndex,
    size,
    style,
    border,
}: {
    playerIndex: number;
    size: number;
    style?: React.CSSProperties;
    border?: string;
}) => {
    const color = PLAYER_COLORS[playerIndex];
    const passed = useTypedSelector(state => getHasPlayerPassed(playerIndex, state));
    return (
        <PlayerIconBase size={size} color={color} border={border} passed={passed} style={style} />
    );
};

export const PlayerCorpAndIcon = ({
    player,
    color,
    includeUsername,
    isInline,
    style,
}: {
    player: PlayerState;
    color?: string;
    includeUsername?: boolean;
    isInline?: boolean;
    style?: React.CSSProperties;
}) => {
    let text = player.corporation?.name ?? '';
    if (!text) {
        text = player.username;
    } else if (includeUsername) {
        text = `${text} (${player.username})`;
    }

    const playerIconStyle: React.CSSProperties = isInline
        ? {
              position: 'relative',
              top: 2,
          }
        : {};

    return (
        <Flex
            display="inline-flex"
            alignItems={isInline ? 'baseline' : 'center'}
            justifyContent="center"
            style={{...style, fontWeight: style?.fontWeight ?? '700'}}
        >
            <PlayerIcon playerIndex={player.index} size={12} style={playerIconStyle} />
            <span style={{marginLeft: 4, color: color ?? 'black'}}>{text}</span>
        </Flex>
    );
};
