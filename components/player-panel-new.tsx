import {Flex} from 'components/box';
import ReactDOM from 'react-dom';
import {GenericCardTitleBar, getCardTitleColorForType} from 'components/card/CardTitle';
import {PlayerIcon} from 'components/icons/player';
import {TagIcon} from 'components/icons/tag';
import {PlayerPanelSection} from 'components/player-panel-section';
import {ScorePopover} from 'components/popovers/score-popover';
import {PlayerResourceBoard} from 'components/resource';
import TexturedCard from 'components/textured-card';
import {colors} from 'components/ui';
import {GameStage} from 'constants/game';
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
import {Card as CardComponent} from 'components/card/Card';

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
    background-color: ${colors.LIGHT_BG};
    padding: 8px;
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
        <OuterWrapper
            flexDirection="column"
            justifyContent="stretch"
            id={`player-board-${player.index}`}
        >
            <Flex flexDirection="column">
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
            </Flex>
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
                        {count}
                    </Flex>
                );
            })}
        </Flex>
    );
}

function PlayerPlayedCards({player}: {player: SerializedPlayerState}) {
    const [hoveredCard, setHoveredCard] = useState<null | CardModel>(null);
    const [_document, setDocument] = useState<null | Document>(null);
    const popperElement = useRef<HTMLDivElement>(null);
    const referenceElement = useRef<HTMLDivElement>(null);
    const {styles, attributes} = usePopper(referenceElement.current, popperElement.current);

    useEffect(() => {
        if (!_document && document) {
            setDocument(document);
        }
    }, []);

    return (
        <Flex flexWrap="wrap" onMouseLeave={() => setHoveredCard(null)} ref={referenceElement}>
            {player.playedCards.map((card, index) => (
                <div onMouseEnter={() => setHoveredCard(getCard(card))}>
                    <CardToken key={index} card={card} />
                </div>
            ))}
            {hoveredCard && (
                <div
                    ref={popperElement}
                    style={{
                        ...styles.popper,
                        zIndex: 10,
                        display: hoveredCard ? 'initial' : 'none',
                    }}
                    {...attributes.popper}
                >
                    <CardComponent card={hoveredCard} />
                </div>
            )}
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
                        textOverflow: 'ellipsis',
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
