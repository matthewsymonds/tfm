import React, {useMemo, useState} from 'react';
import {throttle} from 'throttle-debounce';
import styled from 'styled-components';

import {Flex} from '../box';
import {colors} from '../ui';

type ListWithDetailViewProps<T extends {name: string}> = {
    items: Array<T>;
    listWidthPercentage?: number;
    renderListItem: (item: T) => React.ReactNode;
    renderDetailItem: (item: T) => React.ReactNode;
    initialSelectedItemIndex?: number;
};

/**
 * A component that shows a list of items on the left hand side, and a detail view
 * for the selected item on the right hand side.
 */
export function ListWithDetailView<T extends {name: string}>({
    items,
    renderListItem,
    renderDetailItem,
    listWidthPercentage = 30,
    initialSelectedItemIndex = 0,
}: ListWithDetailViewProps<T>) {
    const [selectedItem, setSelectedItem] = useState(
        items[initialSelectedItemIndex]
    );
    const [hoveredItem, setHoveredItem] = useState(null);
    const throttledSetHoveredItem = useMemo(
        () => throttle(100, setHoveredItem),
        [setHoveredItem]
    );
    const visibleItem = hoveredItem ?? selectedItem;

    return (
        <Flex marginBottom="16px" boxSizing="border-box" width="100%">
            <Flex
                flex={`0 0 ${listWidthPercentage}%`}
                flexDirection="column"
                overflow="auto"
            >
                {items.map(item => {
                    return (
                        <CategoryListItem
                            key={item.name}
                            onClick={() => setSelectedItem(item)}
                            onMouseEnter={() => {
                                throttledSetHoveredItem(item);
                            }}
                            onMouseMove={() => {
                                throttledSetHoveredItem(item);
                            }}
                            onMouseLeave={() => {
                                throttledSetHoveredItem(null);
                            }}
                            isSelected={selectedItem.name === item.name}
                        >
                            {renderListItem(item)}
                        </CategoryListItem>
                    );
                })}
            </Flex>
            <Flex flex="auto" overflow="auto">
                <Flex
                    flexDirection="column"
                    alignItems="flex-start"
                    width="100%"
                    margin="2px 0 2px 4px"
                    padding="8px"
                    borderRadius="4px"
                    background={colors.DARK_2}
                >
                    {renderDetailItem(visibleItem)}
                </Flex>
            </Flex>
        </Flex>
    );
}

const CategoryListItem = styled(Flex)<{isSelected: boolean}>`
    border-radius: 4px;
    margin: 2px 0;
    padding: 4px 6px;
    font-size: 0.8em;
    justify-content: flex-start;
    align-items: center;
    white-space: nowrap;
    cursor: default;
    color: ${colors.TEXT_LIGHT_1};
    transition: 200ms all;

    ${props => {
        if (props.isSelected) {
            return `
                background: ${colors.DARK_2};
            `;
        } else {
            return `
                opacity: 0.4;

                &:hover {
                    opacity: 0.7;
                }
            `;
        }
    }}

    &:hover {
        background-color: ${colors.DARK_2};

        &:active {
            transform: scale(0.98);
        }
    }
`;
