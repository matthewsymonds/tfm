import React, {useMemo, useState} from 'react';
import {throttle} from 'throttle-debounce';
import styled from 'styled-components';

import {Flex} from '../box';
import {colors} from '../ui';

type ListWithDetailViewProps<T extends {name: string}> = {
    items: Array<T>;
    renderListItem: (item: T) => React.ReactNode;
    renderDetailItem: (item: T) => React.ReactNode;
    listWidthPercentage?: number;
    initialSelectedItemIndex?: number;
    detailItemContainerStyleOverride?: React.CSSProperties;
    selectedBgColor?: string;
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
    detailItemContainerStyleOverride,
    selectedBgColor = colors.DARK_2,
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
        <Flex boxSizing="border-box" width="100%">
            <Flex
                flex={`0 0 calc(${listWidthPercentage}% - 2px)`}
                flexDirection="column"
                overflow="auto"
                marginRight="2px"
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
                            selectedBgColor={selectedBgColor}
                        >
                            {renderListItem(item)}
                        </CategoryListItem>
                    );
                })}
            </Flex>
            <Flex
                flex="auto"
                overflow="auto"
                flexDirection="column"
                alignItems="flex-start"
                width="100%"
                margin="2px 0 2px 2px"
                borderRadius="4px"
                padding="8px"
                background={selectedBgColor}
                style={detailItemContainerStyleOverride}
            >
                {renderDetailItem(visibleItem)}
            </Flex>
        </Flex>
    );
}

const CategoryListItem = styled(Flex)<{
    isSelected: boolean;
    selectedBgColor: string;
}>`
    border-radius: 4px;
    margin: 2px 0;
    padding: 4px 6px;
    font-size: 0.8em;
    justify-content: flex-start;
    align-items: center;
    white-space: nowrap;
    cursor: default;
    color: ${colors.TEXT_LIGHT_1};
    transition: 200ms transform;

    ${props => {
        if (props.isSelected) {
            return `
                background-color: ${props.selectedBgColor};
            `;
        } else {
            return `
                opacity: 0.5;

                &:hover {
                    opacity: 0.7;
                }
            `;
        }
    }}

    &:hover {
        background-color: ${props => props.selectedBgColor};

        &:active {
            transform: scale(0.98);
        }
    }
`;
