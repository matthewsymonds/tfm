import React, {useState} from 'react';
import styled from 'styled-components';
import {colors} from './ui';

export function SelectButtons<T>({
    selectedItem,
    setSelectedItem,
    itemRenderer,
    items,
    isSelected: _isSelected,
}: {
    selectedItem: T;
    setSelectedItem: (item: T) => void;
    itemRenderer: (item: T) => React.ReactElement;
    items: Array<T>;
    isSelected?: (item: T) => void;
}) {
    const [randomId] = useState(() => Math.random());

    return (
        <SelectButtonContainer>
            {items.map((item, index) => {
                const inputId = `${randomId}-${index}`;
                const isSelected = _isSelected?.(item) ?? item === selectedItem;
                return (
                    <React.Fragment key={index}>
                        <input
                            type="radio"
                            id={inputId}
                            style={{display: 'none'}}
                            checked={isSelected}
                            onChange={() => setSelectedItem(item)}
                        />
                        <SelectButtonLabel
                            htmlFor={inputId}
                            isSelected={isSelected}
                        >
                            {itemRenderer(item)}
                        </SelectButtonLabel>
                    </React.Fragment>
                );
            })}
        </SelectButtonContainer>
    );
}

const SelectButtonContainer = styled.div`
    display: flex;
    flex: none;
    border-radius: 4px;

    > label:last-child {
        margin-right: 0;
    }
`;

const SelectButtonLabel = styled.label<{isSelected: boolean}>`
    padding: 4px 12px;
    display: flex;

    margin-right: 8px;
    justify-content: center;
    align-items: center;
    border-radius: 2px;
    ${props => {
        if (props.isSelected) {
            return `
                border: 1px solid ${colors.DARK_2};
                background: ${colors.LIGHT_1};
                `;
        } else {
            return `
                background: ${colors.LIGHT_3};
                border: 1px solid ${colors.DARK_2};
                opacity: 0.6;
            `;
        }
    }}

    &:active:hover {
        box-shadow: none;
    }

    &:active:hover {
        position: relative;
        top: 0px;
        left: 0px;
    }

    &:hover {
        position: relative;
        top: -1px;
        left: -1px;
        border: 1px solid ${colors.DARK_2};
        box-shadow: 1px 1px 0 1px ${colors.DARK_3};
    }
`;
