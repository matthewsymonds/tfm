import {useState} from 'react';
import {ScorePopover} from 'components/popovers/score-popover';
import {PlayerState} from 'reducer';
import {Pane, Tablist, Heading, Tab} from 'evergreen-ui';
import {CardActionElements, CardComponent} from './card';
import {PlayerResourceBoard} from './resource';
import {PlayerTagCounter} from './tags';
import styled from 'styled-components';

type PlayerOverviewProps = {
    player: PlayerState;
    isLoggedInPlayer: boolean;
};

const TextButton = styled.button`
    display: inline-flex;
    border: 0;
    padding: 0;
    margin: 0;
    line-height: initial;
    background: none;
    font-size: inherit;
    min-width: unset;
    color: blue;
    font-weight: 600;
    font-size: 22px;
    &:hover {
        opacity: 0.75;
        color: blue;
        border: none;
        background: none !important;
    }
    &:active {
        opacity: 1;
    }
`;

type PlayerOverviewTab = 'Corporation' | 'Resources' | 'Tags';

export const PlayerOverview = ({player, isLoggedInPlayer}: PlayerOverviewProps) => {
    const corporation = player.corporation!;
    const terraformRating = player.terraformRating;
    const [currentTab, setCurrentTab] = useState('Corporation');
    const tabs: Array<PlayerOverviewTab> = ['Corporation', 'Resources', 'Tags'];

    function getTabContent(tab: PlayerOverviewTab) {
        if (tab === 'Corporation') {
            return (
                <CardComponent content={corporation}>
                    <CardActionElements
                        player={player}
                        isLoggedInPlayer={isLoggedInPlayer}
                        card={corporation}
                    />
                </CardComponent>
            );
        }

        if (tab === 'Resources') {
            return <PlayerResourceBoard player={player} isLoggedInPlayer={isLoggedInPlayer} />;
        }

        if (tab === 'Tags') {
            return <PlayerTagCounter player={player} />;
        }

        return null;
    }

    return (
        <Pane padding={16}>
            <Heading size={700} color="#222" marginBottom={8} display="flex">
                {player.corporation?.name} (
                <ScorePopover playerIndex={player.index}>
                    <Pane display="inline-flex">
                        <TextButton>{terraformRating} TR</TextButton>
                    </Pane>
                </ScorePopover>
                )
            </Heading>
            <Pane display="flex" flexDirection="column">
                <Tablist marginBottom={16}>
                    {tabs.map(tab => (
                        <Tab
                            key={tab}
                            id={tab}
                            margin={0}
                            marginRight="4px"
                            onSelect={() => setCurrentTab(tab)}
                            isSelected={tab === currentTab}
                            aria-controls={`panel-${tab}`}
                        >
                            {tab}
                        </Tab>
                    ))}
                </Tablist>
                <Pane background="tint1" flex="1">
                    {tabs.map(tab => (
                        <Pane
                            key={tab}
                            id={`panel-${tab}`}
                            role="tabpanel"
                            aria-labelledby={tab}
                            aria-hidden={tab !== currentTab}
                            display={tab === currentTab ? 'block' : 'none'}
                        >
                            {getTabContent(tab)}
                        </Pane>
                    ))}
                </Pane>
            </Pane>
        </Pane>
    );
};
