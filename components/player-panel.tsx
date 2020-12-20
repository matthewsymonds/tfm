import {setCorporation} from 'actions';
import {Flex, PanelWithTabs} from 'components/box';
import {CardSelector} from 'components/card-selector';
import {PlayerIcon} from 'components/icons/player';
import {PlayerPanelSection} from 'components/player-panel-section';
import {ScorePopover} from 'components/popovers/score-popover';
import {GameStage} from 'constants/game';
import {AppContext} from 'context/app-context';
import React, {useContext} from 'react';
import {useDispatch} from 'react-redux';
import {PlayerState, useTypedSelector} from 'reducer';
import styled from 'styled-components';

const CorporationHeader = styled.h2`
    display: flex;
    width: 100%;
    margin: 0 0 16px;
    align-items: center;
    color: #fff;
`;

const TerraformRating = styled.span`
    display: inline-flex;
    cursor: pointer;
    color: #f5923b;
    margin-left: 8px;
    &:hover {
        opacity: 0.75;
        border: none;
        background: none !important;
    }
    &:active {
        opacity: 1;
    }
`;

const CorporationSelector = ({
    player,
    isLoggedInPlayer,
}: {
    player: PlayerState;
    isLoggedInPlayer: boolean;
}) => {
    if (!isLoggedInPlayer) {
        if (player.action) {
            return <div>{player.username} is ready to play.</div>;
        } else {
            return <div>{player.username} is choosing a corporation and cards.</div>;
        }
    }

    const {possibleCorporations, buyCards, corporation} = player;
    if (!buyCards) {
        return (
            <div>
                {player.username} has chosen {corporation.name}.
            </div>
        );
    }

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

type PlayerPanelProps = {
    selectedPlayerIndex: number;
    setSelectedPlayerIndex: (index: number) => void;
};

export const PlayerPanel = ({selectedPlayerIndex, setSelectedPlayerIndex}: PlayerPanelProps) => {
    /**
     * State (todo: use selectors everywhere instead)
     */
    const state = useTypedSelector(state => state);

    /**
     * Hooks
     */
    const context = useContext(AppContext);

    /**
     * State selectors
     */
    const players = useTypedSelector(state => state.players);
    const gameStage = useTypedSelector(state => state?.common?.gameStage);

    /**
     * Derived state
     */
    const loggedInPlayer = context.getLoggedInPlayer(state);
    const selectedPlayer = players.find(p => p.index === selectedPlayerIndex)!;
    const isCorporationSelection = gameStage === GameStage.CORPORATION_SELECTION;
    const terraformRating = selectedPlayer.terraformRating;
    const sections: Array<PlayerPanelSection> = ['Board & Hand', 'Played cards'];

    return (
        <Flex flexDirection="column" justifyContent="stretch">
            <PanelWithTabs
                tabs={players.map(p => {
                    const displayName =
                        gameStage !== GameStage.CORPORATION_SELECTION
                            ? p.corporation.name
                            : p.username;

                    return (
                        <Flex justifyContent="center" alignItems="center">
                            <PlayerIcon size={12} playerIndex={p.index} />
                            <span style={{marginLeft: 4}}>{displayName}</span>
                            {p === loggedInPlayer && <span style={{marginLeft: 4}}>(you)</span>}
                        </Flex>
                    );
                })}
                tabType="player"
                selectedTabIndex={selectedPlayerIndex}
                setSelectedTabIndex={setSelectedPlayerIndex}
            >
                <Flex flexDirection="column">
                    <CorporationHeader>
                        <PlayerIcon size={16} playerIndex={selectedPlayer.index} />
                        <span style={{marginLeft: 8}}>
                            {isCorporationSelection
                                ? selectedPlayer.username
                                : selectedPlayer.corporation.name}
                        </span>
                        <ScorePopover playerIndex={selectedPlayer.index}>
                            <TerraformRating>{terraformRating} TR</TerraformRating>
                        </ScorePopover>
                    </CorporationHeader>
                    {isCorporationSelection ? (
                        <CorporationSelector
                            player={selectedPlayer}
                            isLoggedInPlayer={selectedPlayer.index === loggedInPlayer.index}
                        />
                    ) : (
                        sections.map(section => (
                            <PlayerPanelSection
                                section={section}
                                key={section}
                                player={selectedPlayer}
                                isLoggedInPlayer={selectedPlayer.index === loggedInPlayer.index}
                            />
                        ))
                    )}
                </Flex>
            </PanelWithTabs>
        </Flex>
    );
};
