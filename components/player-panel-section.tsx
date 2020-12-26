import {PlayerPlayedCards} from 'components/player-played-cards';
import {colors} from 'components/ui';
import {GameStage} from 'constants/game';
import {useState} from 'react';
import {PlayerState, useTypedSelector} from 'reducer';
import styled from 'styled-components';
import spawnExhaustiveSwitchError from 'utils';
import {PlayerCardActions} from './player-card-actions';
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

export type PlayerPanelSection = 'Board & Hand' | 'Card Actions' | 'Played Cards';

const CardsInHandMessage = styled.div`
    padding-top: 8px;
`;

export const PlayerPanelSection = ({
    section,
    player,
    isLoggedInPlayer,
}: {
    section: PlayerPanelSection;
    player: PlayerState;
    isLoggedInPlayer: boolean;
}) => {
    const [isSectionContentVisible, setIsSectionContentVisible] = useState(
        section === 'Board & Hand'
    );
    const isGreeneryPlacement = useTypedSelector(
        state => state?.common?.gameStage === GameStage.GREENERY_PLACEMENT
    );
    const isActiveRound = useTypedSelector(
        state => state?.common?.gameStage === GameStage.ACTIVE_ROUND
    );
    const isBuyOrDiscard = useTypedSelector(
        state => state?.common.gameStage === GameStage.BUY_OR_DISCARD
    );
    const numCards = player.cards.length;

    const playerCardsElement = isActiveRound ? (
        <CardsInHandMessage>Cards in hand: {numCards}</CardsInHandMessage>
    ) : isBuyOrDiscard ? (
        <CardsInHandMessage>
            Cards in hand at the end of last round: {player.previousCardsInHand ?? 0}
        </CardsInHandMessage>
    ) : null;

    function getSectionContent() {
        switch (section) {
            case 'Board & Hand':
                return (
                    <>
                        <PlayerResourceBoard
                            plantConversionOnly={isGreeneryPlacement}
                            player={player}
                            isLoggedInPlayer={isLoggedInPlayer}
                        />
                        {playerCardsElement}
                    </>
                );
            case 'Card Actions':
                return <PlayerCardActions player={player} />;
            case 'Played Cards':
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
