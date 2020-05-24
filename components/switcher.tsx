import React, {Children, ReactElement, useState} from 'react';
import styled from 'styled-components';
import {Box} from './box';

const Tabs = styled.div`
    display: flex;
    width: 100%;
    font-family: sans-serif;
`;

const Tab = styled.div<{selected: boolean}>`
    margin: 8px;
    padding: 8px;
    border: 2px solid ${props => (props.selected ? 'green' : 'rgba(0, 0, 0, 0)')};
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
`;

const defaultTabs: string[] = [];

export function Switcher({children, tabs = defaultTabs}) {
    const [selectedTabIndex, setSelectedTabIndex] = useState(0);

    if (Children.count(children) !== tabs.length) {
        throw new Error('Tabs must match React children in Switcher.');
    }
    return (
        <>
            <Tabs>
                {tabs.map((tab, index) => (
                    <Tab
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
                        <Box display={childIndex === selectedTabIndex ? 'block' : 'none'}>
                            {child}
                        </Box>
                    );
                })}
            </SwitcherChildContainer>
        </>
    );
}
