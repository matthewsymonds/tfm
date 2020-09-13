import {colors} from 'components/ui';
import React, {ReactNode} from 'react';
import styled from 'styled-components';

interface BoxProps {
    margin: string;
    marginTop: string;
    marginBottom: string;
    marginLeft: string;
    marginRight: string;
    display: string;
    position: string;
    top: string;
    bottom: string;
    left: string;
    right: string;
    width: string;
    height: string;
    maxWidth: string;
    maxHeight: string;
    minHeight: string;
    minWidth: string;
    padding: string;
    paddingLeft: string;
    paddingTop: string;
    paddingBottom: string;
    paddingRight: string;
    whiteSpace: string;
    textAlign: string;
    overflowY: string;
    overflowX: string;
    overflow: string;
    background: string;
    border: string;
}

interface FlexProps extends BoxProps {
    flexDirection: string;
    justifyContent: string;
    flex: string;
    alignItems: string;
    flexBasis: string;
    flexWrap: string;
}

/* A flexible component to define styles inline */
export const Box = styled.div<Partial<BoxProps>>`
    /* Add more properties here as needed. */
    margin: ${props => props.margin};
    margin-top: ${props => props.marginTop};
    margin-bottom: ${props => props.marginBottom};
    margin-left: ${props => props.marginLeft};
    margin-right: ${props => props.marginRight};
    display: ${props => props.display};
    position: ${props => props.position};
    bottom: ${props => props.bottom};
    left: ${props => props.left};
    right: ${props => props.right};
    top: ${props => props.top};
    width: ${props => props.width};
    height: ${props => props.height};
    max-width: ${props => props.maxWidth};
    max-height: ${props => props.maxHeight};
    min-height: ${props => props.minHeight};
    min-width: ${props => props.minWidth};
    padding: ${props => props.padding};
    padding-left: ${props => props.paddingLeft};
    padding-top: ${props => props.paddingTop};
    padding-bottom: ${props => props.paddingBottom};
    padding-right: ${props => props.paddingRight};
    white-space: ${props => props.whiteSpace};
    text-align: ${props => props.textAlign};
    overflow-y: ${props => props.overflowY};
    overflow-x: ${props => props.overflowX};
    overflow: ${props => props.overflow};
    background: ${props => props.background};
    border: ${props => props.border};
`;

export const Flex = styled(Box)<Partial<FlexProps>>`
    display: flex;
    flex-direction: ${props => props.flexDirection};
    justify-content: ${props => props.justifyContent};
    flex: ${props => props.flex};
    align-items: ${props => props.alignItems};
    flex-basis: ${props => props.flexBasis};
`;

export const Panel = styled.div`
    margin-bottom: 16px;
    padding: 8px;
    margin-bottom: 16px;
    padding: 8px;
    border-color: ${colors.PANEL_BORDER};
    border-radius: 8px;
    border-width: 2px;
    border-style: solid;
`;

type PanelWithTabsProps = {
    tabs: Array<ReactNode>;
    selectedTabIndex: number;
    setSelectedTabIndex: (tabIndex: number) => void;
    tabType: string;
    children: ReactNode;
};

export const PanelWithTabs = ({
    tabs,
    selectedTabIndex,
    setSelectedTabIndex,
    tabType,
    children,
}: PanelWithTabsProps) => {
    return (
        <React.Fragment>
            <Tabs
                tabs={tabs}
                selectedTabIndex={selectedTabIndex}
                setSelectedTabIndex={setSelectedTabIndex}
                tabType={tabType}
            />
            <Panel>{children}</Panel>
        </React.Fragment>
    );
};

type TabsProps = Pick<
    PanelWithTabsProps,
    'tabs' | 'selectedTabIndex' | 'setSelectedTabIndex' | 'tabType'
>;

export const Tabs = ({tabs, selectedTabIndex, setSelectedTabIndex, tabType}: TabsProps) => {
    return (
        <Flex marginLeft="8px" position="relative" bottom="-2px">
            {tabs.map((tab, index) => {
                const inputId = `${tabType}-${index}`;
                const isSelected = selectedTabIndex === index;
                return (
                    <React.Fragment key={index}>
                        <HiddenInput
                            type="radio"
                            id={inputId}
                            checked={isSelected}
                            onChange={() => setSelectedTabIndex(index)}
                        />
                        <TabLabel htmlFor={inputId} isSelected={isSelected}>
                            {tab}
                        </TabLabel>
                    </React.Fragment>
                );
            })}
        </Flex>
    );
};

const HiddenInput = styled.input`
    display: none;
`;

const TabLabel = styled.label<{isSelected: boolean}>`
    margin-right: 4px;
    padding: 4px 8px;
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
    font-size: 13px;
    font-weight: 600;
    color: ${colors.TEXT_LIGHT_1};
    cursor: pointer;
    border-color: ${colors.PANEL_BORDER};
    border-width: 2px;
    border-style: solid;

    border-bottom-color: ${props => (props.isSelected ? colors.MAIN_BG : colors.PANEL_BORDER)};
    background-color: ${colors.MAIN_BG};
    opacity: ${props => (props.isSelected ? 1 : 0.5)};
`;
