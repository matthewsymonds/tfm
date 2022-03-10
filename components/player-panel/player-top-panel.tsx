import {Flex} from 'components/box';
import {PlayerIcon} from 'components/icons/player';
import {PlayerResourceBoard} from 'components/player-panel/player-resource-board';
import {ScorePopover} from 'components/popovers/score-popover';
import {colors} from 'components/ui';
import {GameStage} from 'constants/game';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import React from 'react';
import {PlayerState, useTypedSelector} from 'reducer';
import styled from 'styled-components';
import {NoClickOverlay} from './player-bottom-panel';

const FirstPlayerToken = styled.div<{last?: boolean}>`
    position: absolute;
    display: flex;
    font-family: 'Open Sans', sans-serif;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.9em;
    color: #292929;
    border-radius: 100%;
    border: 1px solid #545454;
    width: 20px;
    height: 20px;
    top: -10px;
    left: ${props => (props.last ? '-10px' : 'initial')};
    right: ${props => (!props.last ? '-10px' : 'initial')};
    background-color: ${colors.LIGHT_ORANGE};
`;
function getFontSizeForCorporation(string) {
    if (string.length > 24) {
        return '0.65em';
    } else if (string.length > 20) {
        return '0.7em';
    } else if (string.length > 15) {
        return '0.8em';
    } else if (string.length > 10) {
        return '0.85em';
    } else {
        return '0.9em';
    }
}

const CorporationHeader = styled.h2`
    display: inline-flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
    color: #fff;
    cursor: pointer;
    margin-top: 0px;
    margin-bottom: 0px;
`;

const TerraformRating = styled.span`
    display: inline-flex;
    cursor: pointer;
    color: ${colors.GOLD};
    margin-left: 4px;
    &:hover {
        opacity: 0.75;
        border: none;
        background: none !important;
    }
    &:active {
        opacity: 1;
    }
`;

export const PlayerTopPanel = ({
    player,
    isSelected,
}: {
    player: PlayerState;
    isSelected: boolean;
}) => {
    const isCorporationSelection = useTypedSelector(
        state => state.common.gameStage === GameStage.CORPORATION_SELECTION
    );
    const firstPlayerIndex = useTypedSelector(
        state => state.common.firstPlayerIndex
    );
    const loggedInPlayer = useLoggedInPlayer();
    const isFirstPlayer = player.index === firstPlayerIndex;
    const isLoggedInPlayer = player.index === loggedInPlayer.index;
    const isLast = useTypedSelector(
        state =>
            state.players.findIndex(p => p.username === player.username) ===
            state.players.length - 1
    );

    return (
        <Flex
            style={{
                display: 'inline-block',
                position: 'relative',
                padding: 8,
                transition: 'all 300ms ease-in-out',
                background: isSelected ? colors.DARK_2 : 'transparent',
                borderRadius: 4,
            }}
            className="display"
        >
            {!isSelected && <NoClickOverlay />}
            {isFirstPlayer && (
                <FirstPlayerToken last={isLast}>1</FirstPlayerToken>
            )}
            <CorporationHeader>
                <Flex alignItems="center">
                    <PlayerIcon
                        size={16}
                        playerIndex={player.index}
                        shouldDimForPassedPlayers={true}
                    />
                    <span
                        style={{
                            marginLeft: 8,
                            color: isSelected ? colors.LIGHT_1 : colors.LIGHT_2,
                            fontSize: getFontSizeForCorporation(
                                player.corporation.name || player.username
                            ),
                        }}
                        title={`${player.corporation.name ?? ''} (${
                            player.username
                        })`}
                    >
                        {player.corporation.name || player.username}
                    </span>
                </Flex>
                <ScorePopover playerIndex={player.index}>
                    <TerraformRating>
                        {player.terraformRating} TR
                    </TerraformRating>
                </ScorePopover>
            </CorporationHeader>
            <PlayerResourceBoard
                player={player}
                isLoggedInPlayer={isLoggedInPlayer}
            />
        </Flex>
    );
};
