import {Flex} from 'components/box';
import {PlayerIcon} from 'components/icons/player';
import PlayerPlayedCards from 'components/player-played-cards';
import PlayerTagCounts, {TagFilterConfig, TagFilterMode} from 'components/player-tag-counts';
import {ScorePopover} from 'components/popovers/score-popover';
import {PlayerResourceBoard} from 'components/resource';
import {colors} from 'components/ui';
import {GameStage, PLAYER_COLORS} from 'constants/game';
import {AppContext} from 'context/app-context';
import React, {useContext, useRef, useState} from 'react';
import {PlayerState, useTypedSelector} from 'reducer';
import styled from 'styled-components';
import {PlayerCardActions} from './player-card-actions';
import {CorporationSelector} from './player-panel';

const CorporationHeader = styled.h2`
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin: 4px 0;
    align-items: center;
    color: #fff;
`;

const TerraformRating = styled.span`
    display: inline-flex;
    cursor: pointer;
    color: ${colors.GOLD};
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

type PlayerPanelProps = {
    player: PlayerState;
};

const OuterWrapper = styled(Flex)`
    flex-direction: column;
    justify-content: stretch;
    align-items: flex-start;
    padding: 8px;
    /* background: hsl(0, 0%, 20%); */
    width: 250px;
    max-width: 250px;
    border-color: ${props => props.borderColor};
    border-width: 4px;
    border-style: solid;
`;

const CardsInHandMessage = styled.div`
    padding-top: 8px;
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
     * Hooks
     */
    const context = useContext(AppContext);

    /**
     * State selectors
     */
    const gameStage = useTypedSelector(state => state?.common?.gameStage);

    /**
     * Derived state
     */
    const loggedInPlayer = context.getLoggedInPlayer(state);
    const isGreeneryPlacement = gameStage === GameStage.GREENERY_PLACEMENT;
    const isActiveRound = gameStage === GameStage.ACTIVE_ROUND;
    const isCorporationSelection = gameStage === GameStage.CORPORATION_SELECTION;
    const isBetweenRounds =
        gameStage === GameStage.BUY_OR_DISCARD || gameStage === GameStage.DRAFTING;
    const terraformRating = player.terraformRating;

    const numCards = player.cards.length;

    const playerCardsElement = isActiveRound ? (
        <CardsInHandMessage>Cards in hand: {numCards}</CardsInHandMessage>
    ) : isBetweenRounds ? (
        <CardsInHandMessage>
            Cards in hand at the end of last round: {player.previousCardsInHand ?? 0}
        </CardsInHandMessage>
    ) : null;

    return (
        <OuterWrapper
            ref={playerPanelRef}
            borderColor={PLAYER_COLORS[player.index]}
            id={`player-board-${player.index}`}
        >
            <CorporationHeader className="display">
                <Flex alignItems="center">
                    <PlayerIcon size={16} playerIndex={player.index} />
                    <span style={{marginLeft: 8}}>{player.corporation.name}</span>
                </Flex>
                <ScorePopover playerIndex={player.index}>
                    <TerraformRating>{terraformRating} TR</TerraformRating>
                </ScorePopover>
            </CorporationHeader>
            {!isCorporationSelection && (
                <PlayerResourceBoard
                    player={player}
                    plantConversionOnly={isGreeneryPlacement}
                    isLoggedInPlayer={player.index === loggedInPlayer.index}
                />
            )}
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
            {isCorporationSelection ? (
                <CorporationSelector
                    player={player}
                    isLoggedInPlayer={player.index === loggedInPlayer.index}
                />
            ) : null}
        </OuterWrapper>
    );
};

export default PlayerPanel;
