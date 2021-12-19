import {Flex} from 'components/box';
import {colors} from 'components/ui';
import {PLAYER_COLORS} from 'constants/game';
import {PlayerState, useTypedSelector} from 'reducer';
import {getHasPlayerPassed} from 'selectors/get-has-player-passed';
import styled from 'styled-components';

const PlayerIconBase = styled.div<{
    size: number | string;
    color: string;
    passed: boolean;
    border?: string;
}>`
    width: ${props => (typeof props.size === 'number' ? `${props.size}px` : props.size)};
    height: ${props => (typeof props.size === 'number' ? `${props.size}px` : props.size)};
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
    shouldDimForPassedPlayers = false,
}: {
    playerIndex: number;
    size: number | string;
    style?: React.CSSProperties;
    border?: string;
    shouldDimForPassedPlayers?: boolean;
}) => {
    const color = PLAYER_COLORS[playerIndex];
    const passed = useTypedSelector(state => getHasPlayerPassed(playerIndex, state));
    return (
        <PlayerIconBase
            size={size}
            color={color}
            border={border}
            passed={shouldDimForPassedPlayers && passed}
            style={style}
        />
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

    const playerIconStyle: React.CSSProperties = {
        ...(isInline
            ? {
                  position: 'relative',
                  top: 2,
              }
            : {}),
    };

    const fontSize = style?.fontSize ?? '0.8em';
    return (
        <Flex
            display="inline-flex"
            alignItems={isInline ? 'baseline' : 'center'}
            justifyContent="center"
            style={{...style, fontSize: fontSize, fontWeight: style?.fontWeight ?? '500'}}
        >
            <PlayerIcon
                border={color}
                playerIndex={player.index}
                size={fontSize}
                style={playerIconStyle}
            />
            <span style={{marginLeft: 4, color: color ?? colors.TEXT_DARK_1}}>{text}</span>
        </Flex>
    );
};
