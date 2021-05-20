import {Flex} from 'components/box';
import {LiveCard as LiveCardComponent} from 'components/card/Card';
import {getCardTitleColorForType} from 'components/card/CardTitle';
import {TagFilterConfig, TagFilterMode} from 'components/player-tag-counts';
import TexturedCard from 'components/textured-card';
import {Tag} from 'constants/tag';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import {dummyCard} from 'models/card';
import React, {useEffect, useRef, useState} from 'react';
import {usePopper} from 'react-popper';
import {getCard} from 'selectors/get-card';
import {SerializedCard, SerializedPlayerState} from 'state-serialization';
import styled from 'styled-components';
import {Box} from 'components/box';

const CARD_TOKEN_WIDTH = 50;
const ACTUAL_CARD_TOKEN_WIDTH = 56; // thicc borders
const CARD_TOKEN_HEIGHT = 40;

function PlayerPlayedCards({
    player,
    playerPanelRef,
    tagFilterConfig,
}: {
    player: SerializedPlayerState;
    playerPanelRef: React.RefObject<HTMLDivElement>;
    tagFilterConfig: TagFilterConfig;
}) {
    const [hoveredCardIndex, setHoveredCardIndex] = useState<null | number>(null);
    const {filterMode, filteredTags} = tagFilterConfig;
    const loggedInPlayer = useLoggedInPlayer();
    const containerRef = useRef<HTMLDivElement>(null);
    const filteredCards =
        filterMode === TagFilterMode.ALL
            ? player.playedCards
            : player.playedCards.filter(card => {
                  const hydratedCard = getCard(card);
                  // Make sure event cards are only listed for opponents if
                  // an event tag filter is clicked.
                  if (
                      hydratedCard.tags.includes(Tag.EVENT) &&
                      !filteredTags.includes(Tag.EVENT) &&
                      player.index !== loggedInPlayer.index
                  ) {
                      return false;
                  }
                  return hydratedCard.tags.some(cardTag => filteredTags.includes(cardTag));
              });
    const hoveredCard = hoveredCardIndex === null ? null : getCard(filteredCards[hoveredCardIndex]);
    const popperElement = useRef<HTMLDivElement>(null);
    const {styles, attributes, forceUpdate} = usePopper(
        playerPanelRef.current,
        popperElement.current,
        {
            placement: 'top-start',
        }
    );

    function _setHoveredCardIndex(indexOrNull: null | number) {
        setHoveredCardIndex(indexOrNull);
        setTimeout(() => {
            forceUpdate?.();
        }, 0);
    }

    const [requiredOverlapAmountPx, setRequiredOverlapAmountPx] = useState(0);

    useEffect(() => {
        let requiredOverlapAmountPx: number; // may be negative
        if (filteredCards.length === 0 || filteredCards.length === 1) {
            requiredOverlapAmountPx = 0;
        } else {
            requiredOverlapAmountPx = Math.max(
                filteredCards.length * ACTUAL_CARD_TOKEN_WIDTH -
                    (containerRef.current?.offsetWidth ?? 0),
                0
            );
            setRequiredOverlapAmountPx(requiredOverlapAmountPx);
        }
    }, [containerRef.current, filteredCards.length]);

    function getCardPosition(index: number) {
        let xOffset;
        const requiredOverlapPerCard = requiredOverlapAmountPx / (filteredCards.length - 1);

        if (requiredOverlapAmountPx > 0) {
            // cards are overlapping
            const visibleWidthPerCard = ACTUAL_CARD_TOKEN_WIDTH - requiredOverlapPerCard;
            xOffset = index * visibleWidthPerCard;

            const isHighlighted = index === hoveredCardIndex;
            if (hoveredCardIndex !== null && !isHighlighted) {
                // if another card is highlighted, push cards away from the highlighted card
                if (hoveredCardIndex < index) {
                    // to the right of highlighted card, push over (overflow is hidden)
                    xOffset += requiredOverlapPerCard;
                } else {
                    // to the left of highlighted card, push over (overflow is hidden))
                    xOffset -= requiredOverlapPerCard;
                }
            }
        } else {
            // cards are not overlapping
            xOffset = index * (ACTUAL_CARD_TOKEN_WIDTH + 2); // 2 is for spacing
        }

        return `translateX(${xOffset}px)`;
    }

    return (
        <div style={{width: '100%'}} ref={containerRef}>
            <Flex flexWrap="wrap" onMouseLeave={() => _setHoveredCardIndex(null)}>
                {filteredCards.map((card, index) => (
                    <div key={card.name + index} onMouseEnter={() => _setHoveredCardIndex(index)}>
                        <CardToken card={card} />
                    </div>
                ))}
            </Flex>
            <div
                ref={popperElement}
                style={{
                    ...styles.popper,
                    zIndex: 10,
                }}
                {...attributes.popper}
            >
                {hoveredCard && <LiveCardComponent card={hoveredCard ?? dummyCard} />}
            </div>
        </div>
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
        <TexturedCard
            height={CARD_TOKEN_HEIGHT}
            width={CARD_TOKEN_WIDTH}
            style={{margin: '0 2px 2px 0'}}
            borderRadius={2}
        >
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

export default PlayerPlayedCards;
