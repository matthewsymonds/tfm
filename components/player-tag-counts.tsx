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
    flex-shrink: 0;
    width: 51px;

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
    height: 32px;
    min-width: 45px;
    margin-right: 4px;
    opacity: ${props => (props.isEnabled ? 1 : 0.4)};
    transition: opacity 150ms;
    padding: 2px 6px;
    cursor: default;

    &:active {
        opacity: 1;
    }

    background-color: ${props => (props.isEnabled ? colors.CARD_BORDER_1 : '')};
    &:hover {
        background-color: ${colors.CARD_BORDER_1};
        opacity: ${props => (props.isEnabled ? 1 : 0.8)};
    }
`;

export enum TagFilterMode {
    ALL = 'all',
    GREEN = 'green',
    BLUE = 'blue',
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
            if ([TagFilterMode.ALL, TagFilterMode.BLUE, TagFilterMode.GREEN].includes(filterMode)) {
                // if there's only one tag, don't do anything
                if (Object.keys(tagCountsByName).length === 1) return;
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
                    if (filteredTags.length + 1 === Object.keys(tagCountsByName).length) {
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
        [filteredTags.length, tagCountsByName]
    );

    return (
        <Flex margin="8px 0" alignItems="center" justifyContent="space-between" width="100%">
            <Flex>
                <AllButton
                    onClick={() =>
                        setTagFilterConfig({filterMode: TagFilterMode.ALL, filteredTags: []})
                    }
                    isEnabled={filterMode === TagFilterMode.ALL}
                >
                    <span>All</span>
                </AllButton>
                <AllButton
                    onClick={() =>
                        setTagFilterConfig({filterMode: TagFilterMode.BLUE, filteredTags: []})
                    }
                    isEnabled={filterMode === TagFilterMode.BLUE}
                >
                    <span>Blue</span>
                </AllButton>
                <AllButton
                    onClick={() =>
                        setTagFilterConfig({filterMode: TagFilterMode.GREEN, filteredTags: []})
                    }
                    isEnabled={filterMode === TagFilterMode.GREEN}
                >
                    <span>Green</span>
                </AllButton>
            </Flex>
            <Flex flexWrap="wrap" flexDirection="row">
                {Object.entries(tagCountsByName).map(tagCount => {
                    const [tag, count] = tagCount;
                    return (
                        <TagButton
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            isSelected={filteredTags.includes(tag as Tag)}
                            allSelected={filterMode === TagFilterMode.ALL}
                            style={{marginRight: 4}}
                        >
                            <Flex justifyContent="center" alignItems="center">
                                <TagIcon size={25} name={tag as Tag} />
                                <span
                                    className="display"
                                    style={{
                                        color: 'white',
                                        marginLeft: 2,
                                        textAlign: 'center',
                                        flexGrow: 1,
                                    }}
                                >
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
