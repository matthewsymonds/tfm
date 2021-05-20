import {Flex} from 'components/box';
import PlayerPlayedCards from 'components/player-played-cards';
import PlayerTagCounts, {TagFilterConfig, TagFilterMode} from 'components/player-tag-counts';
import {colors} from 'components/ui';
import {GameStage} from 'constants/game';
import React, {useRef, useState} from 'react';
import {PlayerState, useTypedSelector} from 'reducer';
import styled from 'styled-components';
import {CorporationSelector} from './corporation-selector';
import {PlayerCardActions} from './player-card-actions';

type PlayerPanelProps = {
    player: PlayerState;
};

const OuterWrapper = styled(Flex)`
    flex-direction: column;
    justify-content: stretch;
    align-items: flex-start;
    padding: 8px;
    /* background: hsl(0, 0%, 20%); */
    width: 100%;
`;

const CardsInHandMessage = styled.div`
    color: #ccc;
    font-size: 11px;
`;

const PlayerPanel = ({player}: PlayerPanelProps) => {
    /**
     * State (todo: use selectors everywhere instead)
     */
    const state = useTypedSelector(state => state);
    const playerPanelRef = useRef<HTMLDivElement>(null);
    const [tagFilterConfig, setTagFilterConfig] = useState<TagFilterConfig>({
        filterMode: TagFilterMode.ALL,
        filteredTags: [],
    });

    /**
     * State selectors
     */
    const gameStage = useTypedSelector(state => state?.common?.gameStage);

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
        <OuterWrapper ref={playerPanelRef} id={`player-board-${player.index}`}>
            {playerCardsElement}

            {!isCorporationSelection && (
                <React.Fragment>
                    <PlayerTagCounts
                        player={player}
                        tagFilterConfig={tagFilterConfig}
                        setTagFilterConfig={setTagFilterConfig}
                    />
                    <PlayerPlayedCards
                        player={player}
                        playerPanelRef={playerPanelRef}
                        tagFilterConfig={tagFilterConfig}
                    />
                </React.Fragment>
            )}

            <Flex marginTop="12px" background={colors.LIGHT_2} width="100%" flexWrap="wrap">
                <PlayerCardActions player={player} />
            </Flex>
            {isCorporationSelection ? <CorporationSelector player={player} /> : null}
        </OuterWrapper>
    );
};

export default PlayerPanel;
