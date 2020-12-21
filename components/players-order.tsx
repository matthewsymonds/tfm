import {PLAYER_COLORS} from 'constants/game';
import {Tooltip} from 'react-tippy';
import {GameState, useTypedSelector} from 'reducer';
import {getHasPlayerPassed} from 'selectors/get-has-player-passed';
import styled from 'styled-components';
import {ColoredTooltip} from './colored-tooltip';
import {PlayerIcon} from './icons/player';
import {colors} from './ui';

export function PlayersOrder() {
    const playerIndexes = useTypedSelector(state => state.common.playerIndexOrderForGeneration);
    return (
        <PlayersOrderBase>
            {playerIndexes.map(playerIndex => {
                const tooltipText = useTypedSelector(state => getTooltipText(playerIndex, state));
                const color = PLAYER_COLORS[playerIndex];
                return (
                    <Tooltip
                        key={playerIndex}
                        sticky={true}
                        animation="fade"
                        html={
                            <ColoredTooltip color={color} marginTop={8}>
                                {tooltipText}
                            </ColoredTooltip>
                        }
                    >
                        <PlayerIconSpacing>
                            <PlayerIcon playerIndex={playerIndex} size={12} />
                        </PlayerIconSpacing>
                    </Tooltip>
                );
            })}
        </PlayersOrderBase>
    );
}

const PlayersOrderBase = styled.div`
    display: flex;
    margin: 8px;
    background: ${colors.MAIN_BG};
    border-radius: 3px;
`;

const PlayerIconSpacing = styled.div`
    margin: 8px;
`;

function getTooltipText(playerIndex: number, state: GameState): string {
    const player = state.players[playerIndex];
    const {name} = player.corporation;

    const passed = getHasPlayerPassed(playerIndex, state);
    const firstPlayer = state.common.firstPlayerIndex === playerIndex;
    const currentPlayer = state.common.currentPlayerIndex === playerIndex;
    if (passed && firstPlayer) {
        return `${name} is first player and has passed`;
    }

    if (passed) {
        return `${name} has passed`;
    }

    if (firstPlayer && currentPlayer) {
        return `${name} is first player and playing`;
    }

    if (firstPlayer) {
        return `${name} is first player`;
    }

    if (currentPlayer) {
        return `${name} is playing`;
    }

    return name;
}
