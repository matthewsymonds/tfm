import {Card, CardContext, CARD_HEIGHT, CARD_WIDTH} from 'components/card/Card';
import {colors, zIndices} from 'components/ui';
import {usePrevious} from 'hooks/use-previous';
import {Card as CardModel} from 'models/card';
import React, {useEffect, useRef, useState} from 'react';
import {PlayerState} from 'reducer';
import styled from 'styled-components';
import {throttle} from 'throttle-debounce';

const MINIMUM_OVERLAP_PERCENT = 0.5; // e.g. cards will at least overlap by 50%. May be more if there are more cards

const CardHandContainer = styled.div<{
    shouldShow: boolean;
    shouldHoist: boolean;
}>`
    width: 100%;
    height: ${CARD_HEIGHT}px;
    position: fixed;
    bottom: 0;
    transform: translateY(
        ${props =>
            props.shouldShow ? (props.shouldHoist ? '60px' : '200px') : '500px'}
    );
    transition: transform ease-in-out 0.5s;
    z-index: 5; /* HACK because of tile name tags */

    // disable pointer events so we don't disable the clicks on the bottom part of the screen. when
    // the cards aren't being looked at. we explicitly enable pointer-events on the cards themselves.
    // ideally, even when cards are being looked at, we only need pointer events on the cards +
    // an "active area" of maybe 30px margin around the active card, but this gets us 90% of the way there
    pointer-events: ${props =>
        props.shouldShow && props.shouldHoist ? 'initial' : 'none'};
`;

const MinimizeCardsButton = styled.button`
    width: 40px;
    height: 40px;
    position: fixed;
    right: 15px;
    bottom: 15px;
    opacity: 1;
    border-radius: 50%;
    background-color: ${colors.LIGHT_2};
    padding: 0;
    z-index: 6;
`;

export function CardHand({
    cardInfos,
}: {
    cardInfos: Array<{
        card: CardModel;
        cardContext?: CardContext;
        cardOwner?: PlayerState;
    }>;
}) {
    const cards = cardInfos.map(c => c.card);
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [shouldShowCardHand, setShouldShowCardHand] = useState(true);
    const [highlightedIndex, setHighlightedIndex] = useState<number | null>(
        null
    );
    const prevContainerWidth = usePrevious(containerWidth);

    const cardsLength = cards.length;
    const prevCardsLength = usePrevious(cardsLength);
    useEffect(() => {
        if (cardsLength !== prevCardsLength) {
            setHighlightedIndex(null);
        }
    }, [cardsLength, prevCardsLength]);

    // enforce at least a half CARD_WIDTH padding on each side (x2 = 1 CARD_WIDTH)
    const maximumCardWidth = Math.max(0, containerWidth - CARD_WIDTH / 4);

    // ensure that cards are overlapping at least a little (e.g. when showing few cards
    // on a large screen, we don't want them super spaced out, but consolidated in middle)
    const requiredCardWidth = Math.min(
        (cards.length + 1) * CARD_WIDTH * MINIMUM_OVERLAP_PERCENT,
        maximumCardWidth
    );

    const sidePadding = (containerWidth - requiredCardWidth) / 2;
    // gapBetweenCards will be a negative number
    let gapBetweenCards: number;
    if (cards.length === 0 || cards.length === 1) {
        gapBetweenCards = 0;
    } else {
        gapBetweenCards =
            (requiredCardWidth - cards.length * CARD_WIDTH) /
            (cards.length - 1);
    }

    // Chock full of magic numbers
    function getCardPosition(cardIndex: number) {
        let xOffset = sidePadding + cardIndex * (CARD_WIDTH + gapBetweenCards);
        const isHighlighted = cardIndex === highlightedIndex;
        if (highlightedIndex !== null && !isHighlighted) {
            // if another card is highlighted, push cards away from the highlighted card
            // this math is weird, it assumes gapBetweenCards is negative, it works so /shrug
            const bonusCardPadding = -12;
            if (highlightedIndex < cardIndex) {
                xOffset += -1 * (gapBetweenCards + bonusCardPadding);
            } else {
                xOffset += gapBetweenCards + bonusCardPadding;
            }
        }

        const normalizedHalf = Math.max(0, (cards.length - 1) / 2);
        const distanceToMiddle = Math.abs(normalizedHalf - cardIndex);
        // middle card = 0; edge cards = 1
        let scaleYOffset: number;
        if (normalizedHalf) {
            scaleYOffset = distanceToMiddle / normalizedHalf;
        } else {
            scaleYOffset = 0;
        }
        const yOffset = scaleYOffset * 0.3 * 100; // magic numbers
        return `translate(${xOffset}px, ${isHighlighted ? '-100' : yOffset}px)`;
    }

    // Chock full of magic numbers
    function getCardRotation(cardIndex: number) {
        const isHighlighted = cardIndex === highlightedIndex;
        if (isHighlighted) {
            return 'rotate(0)';
        }

        const normalizedHalf = (cards.length - 1) / 2;
        let scaleRotation: number;
        if (normalizedHalf) {
            const distanceToMiddle = normalizedHalf - cardIndex;
            scaleRotation = distanceToMiddle / normalizedHalf;
        } else {
            scaleRotation = 0;
        }
        return `rotate(${scaleRotation * -5}deg)`;
    }

    function onMouseEnter(cardIndex: number) {
        shouldShowCardHand && setHighlightedIndex(cardIndex);
    }

    function onMouseLeave() {
        shouldShowCardHand && setHighlightedIndex(null);
    }

    function toggleCardDrawer() {
        setShouldShowCardHand(!shouldShowCardHand);
    }

    useEffect(() => {
        const containerElement = containerRef.current;
        if (containerElement) {
            const newContainerWidth =
                containerElement.getBoundingClientRect().width;
            if (newContainerWidth !== prevContainerWidth) {
                setContainerWidth(newContainerWidth);
            }
        }
    }, [
        containerRef.current,
        setContainerWidth,
        prevContainerWidth,
        containerWidth,
    ]);

    useEffect(() => {
        const resize = () => setContainerWidth(window.innerWidth);
        const throttledResize = throttle(200, resize);
        window.addEventListener('resize', throttledResize);
        return () => {
            window.removeEventListener('resize', throttledResize);
        };
    }, []);

    return (
        <React.Fragment>
            <CardHandContainer
                ref={containerRef}
                onMouseLeave={onMouseLeave}
                shouldShow={shouldShowCardHand}
                shouldHoist={typeof highlightedIndex === 'number'}
            >
                {containerWidth
                    ? cardInfos.map(
                          ({card, cardOwner, cardContext}, cardIndex) => {
                              return (
                                  <div
                                      key={card.name}
                                      style={{
                                          position: 'absolute',
                                          transform: `${getCardPosition(
                                              cardIndex
                                          )} ${getCardRotation(cardIndex)}`,
                                          transition: 'transform 0.5s',
                                          transformOrigin: 'center',
                                          pointerEvents: 'initial',
                                          zIndex: zIndices.CARD,
                                      }}
                                      onMouseEnter={() =>
                                          onMouseEnter(cardIndex)
                                      }
                                  >
                                      <Card
                                          card={card}
                                          cardOwner={cardOwner}
                                          cardContext={cardContext}
                                      />
                                  </div>
                              );
                          }
                      )
                    : null}
            </CardHandContainer>
            <MinimizeCardsButton onClick={toggleCardDrawer}>
                {shouldShowCardHand ? '-' : '+'}
            </MinimizeCardsButton>
        </React.Fragment>
    );
}
