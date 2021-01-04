import {BlankButton} from 'components/blank-button';
import {Flex} from 'components/box';
import {PlayerIcon} from 'components/icons/player';
import {TagIcon} from 'components/icons/tag';
import PlayerPlayedCards from 'components/player-played-cards';
import {ScorePopover} from 'components/popovers/score-popover';
import {PlayerResourceBoard} from 'components/resource';
import {colors} from 'components/ui';
import {GameStage, PLAYER_COLORS} from 'constants/game';
import {Tag} from 'constants/tag';
import {AppContext} from 'context/app-context';
import React, {useCallback, useContext, useRef, useState} from 'react';
import {PlayerState, useTypedSelector} from 'reducer';
import {getTagCountsByName} from 'selectors/player';
import {SerializedPlayerState} from 'state-serialization';
import styled from 'styled-components';
import {CorporationSelector} from './player-panel';

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
    color: ${colors.GOLD};
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
    const playerPanelRef = useRef<HTMLDivElement>(null);
    const [filteredTags, setFilteredTags] = useState([...Object.values(Tag)]);

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
    const isCorporationSelection = gameStage === GameStage.CORPORATION_SELECTION;
    const terraformRating = player.terraformRating;

    return (
        <OuterWrapper
            ref={playerPanelRef}
            borderColor={PLAYER_COLORS[player.index]}
            id={`player-board-${player.index}`}
        >
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
            <PlayerTagCounts
                player={player}
                filteredTags={filteredTags}
                setFilteredTags={setFilteredTags}
            />
            <PlayerPlayedCards
                player={player}
                playerPanelRef={playerPanelRef}
                filteredTags={filteredTags}
            />
            {isCorporationSelection ? (
                <CorporationSelector
                    player={player}
                    isLoggedInPlayer={player.index === loggedInPlayer.index}
                />
            ) : null}
        </OuterWrapper>
    );
};

const TagButton = styled(BlankButton)<{isSelected: boolean}>`
    border-radius: 9999px; // pill
    padding: 4px;
    background-color: 'inherit';
    opacity: ${props => (props.isSelected ? 1 : 0.4)};
    cursor: default;
    transition: opacity 150ms;

    &:hover {
        background-color: ${colors.CARD_BORDER_1};
        opacity: ${props => (props.isSelected ? 1 : 0.8)};
    }
`;

const AllButton = styled(BlankButton)<{isEnabled}>`
    border-radius: 9999px; // pill
    color: white;
    font-size: 12px;
    color: white;
    opacity: ${props => (props.isEnabled ? 1 : 0.4)};
    transition: opacity 150ms;
    padding: 2px 6px;
    cursor: default;

    &:active {
        opacity: 1;
    }

    &:hover {
        background-color: ${colors.CARD_BORDER_1};
        opacity: ${props => (props.isEnabled ? 1 : 0.8)};
    }
`;

function PlayerTagCounts({
    player,
    filteredTags,
    setFilteredTags,
}: {
    player: SerializedPlayerState;
    filteredTags: Array<Tag>;
    setFilteredTags: (tags: Array<Tag>) => void;
}) {
    const tagCountsByName = useTypedSelector(() => getTagCountsByName(player));
    const toggleTag = useCallback(
        tag => {
            const allTags = tagCountsByName.map(([t]) => t);
            if (allTags.every(t => filteredTags.includes(t)) && allTags.length > 1) {
                // If everything is selected and user clicks a tag, assume they
                // want to filter to see JUST that tag
                setFilteredTags([tag]);
            } else if (filteredTags.length === 1 && filteredTags[0] === tag) {
                // if only one tag is selected and user clicks it again, assume they
                // want to go back to all
                setFilteredTags(allTags);
            } else {
                // Otherwise, just toggle the tag state
                if (filteredTags.includes(tag)) {
                    setFilteredTags(filteredTags.filter(t => t !== tag));
                } else {
                    setFilteredTags([...filteredTags, tag]);
                }
            }
        },
        [filteredTags, tagCountsByName]
    );

    return (
        <Flex margin="4px 0" alignItems="center">
            <Flex>
                {tagCountsByName.map(tagCount => {
                    const [tag, count] = tagCount;
                    return (
                        <TagButton
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            isSelected={filteredTags.includes(tag)}
                            style={{marginRight: 4}}
                        >
                            <Flex justifyContent="center" alignItems="center">
                                <TagIcon size={24} name={tag as Tag} />
                                <span className="display" style={{color: 'white', marginLeft: 2}}>
                                    {count}
                                </span>
                            </Flex>
                        </TagButton>
                    );
                })}
            </Flex>
            <Flex alignItems="flex-start" flexDirection="column">
                <AllButton
                    onClick={() => setFilteredTags(tagCountsByName.map(([t]) => t))}
                    isEnabled={tagCountsByName.every(([tag]) => filteredTags.includes(tag))}
                >
                    <span>All</span>
                </AllButton>
            </Flex>
        </Flex>
    );
}

export default PlayerPanel;
