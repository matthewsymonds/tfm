import {BlankButton} from 'components/blank-button';
import {Flex} from 'components/box';
import {TagIcon} from 'components/icons/tag';
import {colors} from 'components/ui';
import {Tag} from 'constants/tag';
import React, {useCallback} from 'react';
import {useTypedSelector} from 'reducer';
import {getTagCountsByName} from 'selectors/player';
import {SerializedPlayerState} from 'state-serialization';
import styled from 'styled-components';

const TagButton = styled(BlankButton)<{isSelected: boolean; allSelected: boolean}>`
    border-radius: 9999px; // pill
    padding: 4px;
    background-color: ${props =>
        !props.allSelected && props.isSelected ? colors.CARD_BORDER_1 : 'inherit'};
    opacity: ${props => (props.isSelected || props.allSelected ? 1 : 0.4)};
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

export enum TagFilterMode {
    ALL = 'all',
    SUBSET = 'subset',
}

export type TagFilterConfig = {
    filterMode: TagFilterMode;
    filteredTags: Array<Tag>;
};

function PlayerTagCounts({
    player,
    tagFilterConfig,
    setTagFilterConfig,
}: {
    player: SerializedPlayerState;
    tagFilterConfig: TagFilterConfig;
    setTagFilterConfig: (config: TagFilterConfig) => void;
}) {
    const tagCountsByName = useTypedSelector(() => getTagCountsByName(player));

    const {filterMode, filteredTags} = tagFilterConfig;
    const toggleTag = useCallback(
        tag => {
            if (filterMode === TagFilterMode.ALL) {
                // if there's only one tag, don't do anything
                if (tagCountsByName.length === 1) return;
                // If everything is selected and user clicks a tag, assume they
                // want to filter to see JUST that tag
                setTagFilterConfig({filterMode: TagFilterMode.SUBSET, filteredTags: [tag]});
            } else if (filteredTags.length === 1 && filteredTags[0] === tag) {
                // if only one tag is selected and user clicks it again, assume they
                // want to go back to all
                setTagFilterConfig({filterMode: TagFilterMode.ALL, filteredTags: []});
            } else {
                // Otherwise, just toggle the tag state
                if (filteredTags.includes(tag)) {
                    setTagFilterConfig({
                        filterMode: TagFilterMode.SUBSET,
                        filteredTags: filteredTags.filter(t => t !== tag),
                    });
                } else {
                    if (filteredTags.length + 1 === tagCountsByName.length) {
                        // if they've selected all the tags, go back to all mode
                        setTagFilterConfig({
                            filterMode: TagFilterMode.ALL,
                            filteredTags: [],
                        });
                    } else {
                        // otherwise, stay in subset mode
                        setTagFilterConfig({
                            filterMode: TagFilterMode.SUBSET,
                            filteredTags: [...filteredTags, tag],
                        });
                    }
                }
            }
        },
        [filteredTags.length, tagCountsByName.length]
    );

    return (
        <Flex margin="4px 0" alignItems="center">
            <AllButton
                onClick={() =>
                    setTagFilterConfig({filterMode: TagFilterMode.ALL, filteredTags: []})
                }
                isEnabled={filterMode === TagFilterMode.ALL}
            >
                <span>All</span>
            </AllButton>
            <Flex flexWrap="wrap">
                {tagCountsByName.map(tagCount => {
                    const [tag, count] = tagCount;
                    return (
                        <TagButton
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            isSelected={filteredTags.includes(tag)}
                            allSelected={filterMode === TagFilterMode.ALL}
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
        </Flex>
    );
}

export default PlayerTagCounts;
