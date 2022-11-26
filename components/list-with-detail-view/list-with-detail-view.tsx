import React, {useMemo, useState} from 'react';
import styled from 'styled-components';
import {throttle} from 'throttle-debounce';
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
    layoutBreakpoint?: number;
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
    layoutBreakpoint = 300,
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
        <ListWithDetailViewContainer
            boxSizing="border-box"
            width="100%"
            layoutBreakpoint={layoutBreakpoint}
        >
            <ListItemContainer
                listWidthPercentage={listWidthPercentage}
                layoutBreakpoint={layoutBreakpoint}
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
            </ListItemContainer>
            <DetailViewContainer
                background={selectedBgColor}
                style={detailItemContainerStyleOverride}
                layoutBreakpoint={layoutBreakpoint}
            >
                {renderDetailItem(visibleItem)}
            </DetailViewContainer>
        </ListWithDetailViewContainer>
    );
}

const ListWithDetailViewContainer = styled(Flex)<{layoutBreakpoint: number}>`
    @media (min-width: ${props => props.layoutBreakpoint + 1}px) {
        flex-direction: row;
    }
    @media (max-width: ${props => props.layoutBreakpoint}px) {
        flex-direction: column-reverse;
    }
`;

const ListItemContainer = styled(Flex)<{listWidthPercentage: number}>`
    flex-direction: column;
    overflow: auto;

    @media (min-width: ${props => props.layoutBreakpoint + 1}px) {
        margin-right: 2px;
        flex: ${props => `0 0 calc(${props.listWidthPercentage}% - 2px)`};
    }
    @media (max-width: ${props => props.layoutBreakpoint}px) {
    }
`;

const DetailViewContainer = styled(Flex)<{layoutBreakpoint: number}>`
    flex: auto;
    overflow: auto;
    flex-direction: column;
    align-items: flex-start;
    border-radius: 4px;
    padding: 8px;

    @media (min-width: ${props => props.layoutBreakpoint + 1}px) {
        margin: 2px 0 2px 2px;
    }
    @media (max-width: ${props => props.layoutBreakpoint}px) {
        height: 140px;
        margin: 2px 0;
    }
`;

const CategoryListItem = styled(Flex)<{
    isSelected: boolean;
    selectedBgColor: string;
    layoutBreakpoint: number;
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
