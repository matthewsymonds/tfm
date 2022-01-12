import {Flex} from 'components/box';
import PlayerPlayedCards from 'components/player-panel/player-played-cards';
import PlayerTagCounts, {
    TagFilterConfig,
    TagFilterMode,
} from 'components/player-panel/player-tag-counts';
import {Deck} from 'constants/card-types';
import {GameStage} from 'constants/game';
import React, {useState} from 'react';
import {PlayerState, useTypedSelector} from 'reducer';
import styled from 'styled-components';
import {CorporationSelector} from '../corporation-selector';
import {colors} from '../ui';

type PlayerPanelProps = {
    player: PlayerState;
    isSelected: boolean;
};

const OuterWrapper = styled.div<{isSelected: boolean}>`
    display: flex;
    position: relative;
    transition: all 300ms ease-in-out;
    opacity: ${props => (props.isSelected ? 1 : 0.25)};
    background ${props => (props.isSelected ? colors.DARK_2 : 'transparent')};
    border-radius: 4px;
    boxSizing: border-box;
    flex-direction: column;
    justify-content: stretch;
    align-items: flex-start;
    padding: 8px;
    max-width: 766px;
`;

const CardsInHandMessage = styled.div`
    color: #ccc;
    font-size: 11px;
`;

export const NoClickOverlay = styled.div`
    position: absolute;
    inset: 0;
    height: 100%;
    width: 100%;
    z-index: 3;
    cursor: pointer;
`;

export const PlayerBottomPanel = ({player, isSelected}: PlayerPanelProps) => {
    /**
     * State (todo: use selectors everywhere instead)
     */
    const [tagFilterConfig, setTagFilterConfig] = useState<TagFilterConfig>({
        filterMode: TagFilterMode.ALL,
        filteredTags: [],
    });

    const isColoniesEnabled = useTypedSelector(state =>
        state.options?.decks.includes(Deck.COLONIES)
    );

    const fleets = isColoniesEnabled ? (
        <CardsInHandMessage>Fleets: {player.fleets}</CardsInHandMessage>
    ) : null;

    /**
     * State selectors
     */
    const gameStage = useTypedSelector(state => state.common.gameStage);

    /**
     * Derived state
     */
    const isActiveRound = gameStage === GameStage.ACTIVE_ROUND;
    const isCorporationSelection = gameStage === GameStage.CORPORATION_SELECTION;
    const isBetweenRounds =
        gameStage === GameStage.BUY_OR_DISCARD || gameStage === GameStage.DRAFTING;

    const numCards = player.cards.length;

    const playerCardsElement = isActiveRound ? (
        <CardsInHandMessage>Cards in hand: {numCards}</CardsInHandMessage>
    ) : isBetweenRounds ? (
        <CardsInHandMessage>
            Cards in hand at the end of last round: {player.previousCardsInHand ?? 0}
        </CardsInHandMessage>
    ) : null;

    return (
        <OuterWrapper isSelected={isSelected} id={`player-board-${player.index}`}>
            {!isSelected && <NoClickOverlay />}
            <Flex width="100%" justifyContent="space-between">
                {!isCorporationSelection && playerCardsElement}
                {!isCorporationSelection && fleets}
            </Flex>
            {!isCorporationSelection && (
                <React.Fragment>
                    <PlayerTagCounts
                        player={player}
                        tagFilterConfig={tagFilterConfig}
                        setTagFilterConfig={setTagFilterConfig}
                    />
                    <PlayerPlayedCards player={player} tagFilterConfig={tagFilterConfig} />
                </React.Fragment>
            )}
            {isCorporationSelection ? <CorporationSelector player={player} /> : null}
        </OuterWrapper>
    );
};
