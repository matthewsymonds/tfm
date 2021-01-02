import {Flex} from 'components/box';
import {PlayerIcon} from 'components/icons/player';
import {TagIcon} from 'components/icons/tag';
import {ScorePopover} from 'components/popovers/score-popover';
import {PlayerResourceBoard} from 'components/resource';
import {GameStage, PLAYER_COLORS} from 'constants/game';
import {Tag} from 'constants/tag';
import {AppContext} from 'context/app-context';
import React, {useContext} from 'react';
import {PlayerState, useTypedSelector} from 'reducer';
import {getTagCountsByName} from 'selectors/player';
import {SerializedPlayerState} from 'state-serialization';
import styled from 'styled-components';
import PlayerPlayedCards from 'components/player-played-cards';

const CorporationHeader = styled.h2`
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin: 4px 0;
    align-items: center;
    color: #fff;
`;

const TerraformRating = styled.span`
    display: inline-flex;
    cursor: pointer;
    color: #f5923b;
    margin-left: 8px;
    &:hover {
        opacity: 0.75;
        border: none;
        background: none !important;
    }
    &:active {
        opacity: 1;
    }
`;

type PlayerPanelProps = {
    player: PlayerState;
};

const OuterWrapper = styled(Flex)`
    flex-direction: column;
    justify-content: stretch;
    align-items: flex-end;
    padding: 8px;
    /* background: hsl(0, 0%, 20%); */
    width: 400px;
    max-width: 400px;
    border-color: ${props => props.borderColor};
    border-width: 4px;
    border-style: solid;
`;

const PlayerPanel = ({player}: PlayerPanelProps) => {
    /**
     * State (todo: use selectors everywhere instead)
     */
    const state = useTypedSelector(state => state);

    /**
     * Hooks
     */
    const context = useContext(AppContext);

    /**
     * State selectors
     */
    const gameStage = useTypedSelector(state => state?.common?.gameStage);

    /**
     * Derived state
     */
    const loggedInPlayer = context.getLoggedInPlayer(state);
    const isGreeneryPlacement = gameStage === GameStage.GREENERY_PLACEMENT;
    const terraformRating = player.terraformRating;

    return (
        <OuterWrapper borderColor={PLAYER_COLORS[player.index]} id={`player-board-${player.index}`}>
            <CorporationHeader className="display">
                <Flex alignItems="center">
                    <PlayerIcon size={16} playerIndex={player.index} />
                    <span style={{marginLeft: 8}}>{player.corporation.name}</span>
                </Flex>
                <ScorePopover playerIndex={player.index}>
                    <TerraformRating>{terraformRating} TR</TerraformRating>
                </ScorePopover>
            </CorporationHeader>
            <PlayerResourceBoard
                player={player}
                plantConversionOnly={isGreeneryPlacement}
                isLoggedInPlayer={player.index === loggedInPlayer.index}
            />
            <PlayerTagCounts player={player} />
            <PlayerPlayedCards player={player} />
        </OuterWrapper>
    );
};

function PlayerTagCounts({player}: {player: SerializedPlayerState}) {
    const tagCountsByName = getTagCountsByName(player);
    return (
        <Flex margin="4px 0">
            {tagCountsByName.map(tagCount => {
                const [tag, count] = tagCount;
                return (
                    <Flex key={tag} justifyContent="center" alignItems="center" marginRight="8px">
                        <TagIcon size={24} margin={4} name={tag as Tag} />
                        <span className="display" style={{color: 'white'}}>
                            {count}
                        </span>
                    </Flex>
                );
            })}
        </Flex>
    );
}

export default PlayerPanel;
