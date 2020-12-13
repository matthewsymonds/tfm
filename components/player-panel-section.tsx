import {PlayerPlayedCards} from 'components/player-played-cards';
import {colors} from 'components/ui';
import {GameStage} from 'constants/game';
import {useState} from 'react';
import {PlayerState, useTypedSelector} from 'reducer';
import styled from 'styled-components';
import spawnExhaustiveSwitchError from 'utils';
import {PlayerResourceBoard} from './resource';

const PlayerPanelSectionBase = styled.div`
    background-color: ${colors.ACCORDION_BG};
    border: 2px solid ${colors.ACCORDION_HEADER};
    border-radius: 2px;

    :not(:last-child) {
        margin-bottom: 8px;
    }
`;

const PlayerPanelSectionHeader = styled.div`
    background-color: ${colors.ACCORDION_HEADER};
    padding: 2px;
    padding-bottom: 4px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const PlayerPanelSectionInner = styled.div`
    padding: 6px;
`;

export type PlayerPanelSection = 'Board' | 'Played cards';

export const PlayerPanelSection = ({
    section,
    player,
    isLoggedInPlayer,
}: {
    section: PlayerPanelSection;
    player: PlayerState;
    isLoggedInPlayer: boolean;
}) => {
    const [isSectionContentVisible, setIsSectionContentVisible] = useState(section === 'Board');
    const isGreeneryPlacement = useTypedSelector(
        state => state?.common?.gameStage === GameStage.GREENERY_PLACEMENT
    );

    function getSectionContent() {
        switch (section) {
            case 'Board':
                return (
                    <PlayerResourceBoard
                        plantConversionOnly={isGreeneryPlacement}
                        player={player}
                        isLoggedInPlayer={isLoggedInPlayer}
                    />
                );
            case 'Played cards':
                return <PlayerPlayedCards player={player} />;

            default:
                throw spawnExhaustiveSwitchError(section);
        }
    }

    return (
        <PlayerPanelSectionBase>
            <PlayerPanelSectionHeader
                role="button"
                onClick={() => setIsSectionContentVisible(!isSectionContentVisible)}
            >
                <span>{section}</span>
                <span>{isSectionContentVisible ? '▼' : '▲'}</span>
            </PlayerPanelSectionHeader>
            {isSectionContentVisible && (
                <PlayerPanelSectionInner>{getSectionContent()}</PlayerPanelSectionInner>
            )}
        </PlayerPanelSectionBase>
    );
};
