import {useState} from 'react';
import {ScorePopover} from 'components/popovers/score-popover';
import {PlayerState, useTypedSelector} from 'reducer';
import {Pane, Tablist, Heading, Tab} from 'evergreen-ui';
import {CardActionElements, CardComponent} from './card';
import {PlayerResourceBoard} from './resource';
import {PlayerTagCounter} from './tags';
import styled from 'styled-components';
import {GameStage} from 'constants/game';
import {CardSelector} from './card-selector';
import {setCorporation} from 'actions';
import {useDispatch} from 'react-redux';

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

const CorporationSelector = ({player, isLoggedInPlayer}: PlayerOverviewProps) => {
    if (!isLoggedInPlayer) {
        if (player.action) {
            return <div>{player.username} is ready to play.</div>;
        } else {
            return <div>{player.username} is choosing a corporation and cards.</div>;
        }
    }

    const {possibleCorporations, corporation} = player;

    const dispatch = useDispatch();

    return (
        <>
            <h3>Select a corporation:</h3>
            <CardSelector
                min={1}
                max={1}
                selectedCards={[corporation]}
                onSelect={cards => dispatch(setCorporation(cards[0], player.index))}
                options={possibleCorporations}
                orientation="vertical"
            />
        </>
    );
};

type PlayerOverviewTab = 'Corporation' | 'Resources' | 'Tags';

export const PlayerOverview = ({player, isLoggedInPlayer}: PlayerOverviewProps) => {
    const {corporation} = player;
    const gameStage = useTypedSelector(state => state?.common?.gameStage);

    const isCorporationSelection = gameStage === GameStage.CORPORATION_SELECTION;

    const terraformRating = player.terraformRating;
    const [currentTab, setCurrentTab] = useState('Corporation');
    const tabs: Array<PlayerOverviewTab> = ['Corporation', 'Resources', 'Tags'];

    function getTabContent(tab: PlayerOverviewTab) {
        if (tab === 'Corporation') {
            if (isCorporationSelection) {
                if (!isLoggedInPlayer || player.action === 0) {
                    return (
                        <CorporationSelector player={player} isLoggedInPlayer={isLoggedInPlayer} />
                    );
                }
            }

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
            if (isCorporationSelection) {
                return null;
            }
            return <PlayerResourceBoard player={player} isLoggedInPlayer={isLoggedInPlayer} />;
        }

        if (tab === 'Tags') {
            if (isCorporationSelection) {
                return null;
            }
            return <PlayerTagCounter player={player} />;
        }

        return null;
    }

    return (
        <Pane padding={16}>
            <Heading size={700} color="#222" marginBottom={8} display="flex">
                {isCorporationSelection ? player.username : player.corporation.name} (
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
