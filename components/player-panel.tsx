import React, {useContext} from 'react';
import {useStore, useDispatch} from 'react-redux';
import styled from 'styled-components';

import {useTypedSelector, RootState, PlayerState} from 'reducer';
import {GameStage} from 'constants/game';
import {AppContext} from 'context/app-context';
import {Flex, Panel} from 'components/box';
import {PlayerPanelSection} from 'components/player-panel-section';
import {ScorePopover} from 'components/popovers/score-popover';
import {CardSelector} from 'components/card-selector';
import {setCorporation} from 'actions';

const CorporationHeader = styled.h2`
    display: flex;
    width: 100%;
    margin: 0 0 16px;
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

type PlayerPanelProps = {
    selectedPlayerIndex: number;
};

export const PlayerPanel = ({selectedPlayerIndex}: PlayerPanelProps) => {
    /**
     * State (todo: use selectors everywhere instead)
     */
    const store = useStore<RootState>();
    const state = store.getState();

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
    const selectedPlayer = players.find(p => p.index === selectedPlayerIndex);
    const isCorporationSelection = gameStage === GameStage.CORPORATION_SELECTION;
    const terraformRating = selectedPlayer.terraformRating;
    const sections: Array<PlayerPanelSection> = ['Board', 'Played cards', 'Hand'];

    return (
        <Flex flexDirection="column" justifyContent="stretch">
            <Panel>
                <Flex flexDirection="column">
                    <CorporationHeader>
                        <span>
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
                                player={selectedPlayer}
                                isLoggedInPlayer={selectedPlayer.index === loggedInPlayer.index}
                            />
                        ))
                    )}
                </Flex>
            </Panel>
        </Flex>
    );
};
