import {Flex} from 'components/box';
import {getCardTitleColorForType} from 'components/card/CardTitle';
import {PlayerIcon} from 'components/icons/player';
import {TagIcon} from 'components/icons/tag';
import {ScorePopover} from 'components/popovers/score-popover';
import {PlayerResourceBoard} from 'components/resource';
import TexturedCard from 'components/textured-card';
import {colors} from 'components/ui';
import {GameStage, PLAYER_COLORS} from 'constants/game';
import {Tag} from 'constants/tag';
import {AppContext} from 'context/app-context';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {PlayerState, useTypedSelector} from 'reducer';
import {getCard} from 'selectors/get-card';
import {getTagCountsByName} from 'selectors/player';
import {SerializedCard, SerializedPlayerState} from 'state-serialization';
import styled from 'styled-components';
import {usePopper} from 'react-popper';
import {Card as CardModel} from 'models/card';
import {LiveCard as LiveCardComponent} from 'components/card/Card';

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

type PlayerPanelProps = {
    player: PlayerState;
};

const OuterWrapper = styled(Flex)`
    flex-direction: column;
    justify-content: stretch;
    align-items: flex-end;
    padding: 8px;
    /* background: hsl(0, 0%, 20%); */
    width: 400px;
    max-width: 400px;
    border-color: ${props => props.borderColor};
    border-width: 4px;
    border-style: solid;
`;

const PlayerPanel = ({player}: PlayerPanelProps) => {
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
    const gameStage = useTypedSelector(state => state?.common?.gameStage);

    /**
     * Derived state
     */
    const loggedInPlayer = context.getLoggedInPlayer(state);
    const isGreeneryPlacement = gameStage === GameStage.GREENERY_PLACEMENT;
    const terraformRating = player.terraformRating;

    return (
        <OuterWrapper borderColor={PLAYER_COLORS[player.index]} id={`player-board-${player.index}`}>
            <CorporationHeader className="display">
                <Flex alignItems="center">
                    <PlayerIcon size={16} playerIndex={player.index} />
                    <span style={{marginLeft: 8}}>{player.corporation.name}</span>
                </Flex>
                <ScorePopover playerIndex={player.index}>
                    <TerraformRating>{terraformRating} TR</TerraformRating>
                </ScorePopover>
            </CorporationHeader>
            <PlayerResourceBoard
                player={player}
                plantConversionOnly={isGreeneryPlacement}
                isLoggedInPlayer={player.index === loggedInPlayer.index}
            />
            <PlayerTagCounts player={player} />
            <PlayerPlayedCards player={player} />
        </OuterWrapper>
    );
};

function PlayerTagCounts({player}: {player: SerializedPlayerState}) {
    const tagCountsByName = getTagCountsByName(player);
    return (
        <Flex margin="4px 0">
            {tagCountsByName.map(tagCount => {
                const [tag, count] = tagCount;
                return (
                    <Flex key={tag} justifyContent="center" alignItems="center" marginRight="8px">
                        <TagIcon size={24} margin={4} name={tag as Tag} />
                        <span className="display" style={{color: 'white'}}>
                            {count}
                        </span>
                    </Flex>
                );
            })}
        </Flex>
    );
}

function PlayerPlayedCards({player}: {player: SerializedPlayerState}) {
    const [hoveredCard, setHoveredCard] = useState<null | CardModel>(null);
    const popperElement = useRef<HTMLDivElement>(null);
    const referenceElement = useRef<HTMLDivElement>(null);
    const {styles, attributes, forceUpdate} = usePopper(
        referenceElement.current,
        popperElement.current,
        {
            placement: 'right-start',
        }
    );

    function _setHoveredCard(cardOrNull: null | CardModel) {
        setHoveredCard(cardOrNull);
        setTimeout(() => {
            forceUpdate?.();
        }, 0);
    }

    return (
        <Flex flexWrap="wrap" onMouseLeave={() => _setHoveredCard(null)} ref={referenceElement}>
            {player.playedCards.map((card, index) => (
                <div key={index} onMouseEnter={() => _setHoveredCard(getCard(card))}>
                    <CardToken key={index} card={card} />
                </div>
            ))}
            <div
                ref={popperElement}
                style={{
                    ...styles.popper,
                    zIndex: 10,
                    display: hoveredCard ? 'initial' : 'none',
                }}
                {...attributes.popper}
            >
                {hoveredCard && <LiveCardComponent card={hoveredCard} />}
            </div>
        </Flex>
    );
}

const CardTokenTitleBar = styled.div<{bgColor: string}>`
    position: relative;
    display: flex;
    align-items: center;
    top: 10px;
    padding: 0 3px;
    height: 20px;
    background-color: ${props => props.bgColor};
    cursor: default;
`;

function CardToken({card: serializedCard}: {card: SerializedCard}) {
    const card = getCard(serializedCard);

    return (
        <TexturedCard height={40} width={50} style={{margin: '0 2px 2px 0'}} borderRadius={2}>
            <CardTokenTitleBar className="display" bgColor={getCardTitleColorForType(card.type)}>
                <span
                    style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        color: 'white',
                        fontSize: '9px',
                    }}
                >
                    {card.name}
                </span>
            </CardTokenTitleBar>
        </TexturedCard>
    );
}

export default PlayerPanel;
