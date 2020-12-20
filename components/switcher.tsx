import {PLAYER_COLORS} from 'constants/game';
import React, {Children, ReactNode, useState} from 'react';
import styled from 'styled-components';
import {Box} from './box';

const Tabs = styled.div`
    display: flex;
    width: 100%;
`;

const Tab = styled.div<{selected: boolean; color: string; index: number}>`
    margin: 8px;
    padding: 8px;
    border: 2px solid ${props => (props.selected ? props.color : 'rgba(0, 0, 0, 0)')};
    border-radius: 3px;
    background: ${props => (props.selected ? '#eee' : '#e2e2e2')};
    color: ${props => (props.selected ? 'black' : '#444')};
    cursor: pointer;

    &:hover {
        background: #eee;
    }
`;

const SwitcherChildContainer = styled.div`
    width: 100%;
    text-align: left;
`;

const defaultTabs: ReactNode[] = [];

type SwitcherProps = {
    children: ReactNode;
    tabs: ReactNode[];
    defaultTabIndex?: number;
    color?: string;
};

export function Switcher({
    children,
    tabs = defaultTabs,
    defaultTabIndex = 0,
    color,
}: SwitcherProps) {
    const [selectedTabIndex, setSelectedTabIndex] = useState(defaultTabIndex);

    if (Children.count(children) !== tabs.length) {
        throw new Error('Tabs must match React children in Switcher.');
    }
    return (
        <>
            <Tabs>
                {tabs.map((tab, index) => (
                    <Tab
                        color={color || PLAYER_COLORS[index]}
                        key={index}
                        index={index}
                        selected={index === selectedTabIndex}
                        onClick={() => setSelectedTabIndex(index)}
                    >
                        {tab}
                    </Tab>
                ))}
            </Tabs>
            <SwitcherChildContainer>
                {Children.toArray(children).map((child, childIndex) => {
                    return (
                        <Box
                            width="100%"
                            key={childIndex}
                            display={childIndex === selectedTabIndex ? 'block' : 'none'}
                        >
                            {child}
                        </Box>
                    );
                })}
            </SwitcherChildContainer>
        </>
    );
}
