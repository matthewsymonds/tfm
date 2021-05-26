import {Flex} from 'components/box';
import {GameStage, PLAYER_COLORS} from 'constants/game';
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
            {playerIndexes.map((playerIndex, orderIndex) => {
                const tooltipText = useTypedSelector(state => getTooltipText(playerIndex, state));
                const color = PLAYER_COLORS[playerIndex];
                return (
                    <Tooltip
                        key={playerIndex}
                        unmountHTMLWhenHide={true}
                        sticky={true}
                        animation="fade"
                        html={
                            <ColoredTooltip color={color} marginTop={8}>
                                {tooltipText}
                            </ColoredTooltip>
                        }
                    >
                        <Flex marginLeft={orderIndex > 0 ? '8px' : '0'} alignItems="center">
                            <span className="display" style={{marginRight: 4}}>
                                {orderIndex + 1}
                            </span>
                            <PlayerIcon playerIndex={playerIndex} size={12} />
                        </Flex>
                    </Tooltip>
                );
            })}
        </PlayersOrderBase>
    );
}

const PlayersOrderBase = styled.div`
    display: flex;
    margin: 0 8px;
    padding: 6px;
    background: ${colors.MAIN_BG};
    border-radius: 3px;
`;

function getTooltipText(playerIndex: number, state: GameState): string {
    const player = state.players[playerIndex];
    const {name} = player.corporation;

    const passed = getHasPlayerPassed(playerIndex, state);
    const firstPlayer = state.common.firstPlayerIndex === playerIndex;
    const currentPlayer = state.common.currentPlayerIndex === playerIndex;
    const isActiveRound = state.common.gameStage === GameStage.ACTIVE_ROUND;
    if (!isActiveRound) {
        if (firstPlayer) {
            return `${name} is first player`;
        } else {
            return name;
        }
    }
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
