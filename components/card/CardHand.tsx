import {Card, CardContext, CARD_HEIGHT, CARD_WIDTH} from 'components/card/Card';
import {usePrevious} from 'hooks/use-previous';
import {Card as CardModel} from 'models/card';
import React, {useEffect, useRef, useState} from 'react';
import {PlayerState} from 'reducer';
import styled from 'styled-components';
import {throttle} from 'throttle-debounce';

const MINIMUM_OVERLAP_PERCENT = 0.5; // e.g. cards will at least overlap by 50%. May be more if there are more cards

const CardHandContainer = styled.div<{shouldShow: boolean; shouldHoist: boolean}>`
    width: 100%;
    height: ${CARD_HEIGHT}px;
    position: fixed;
    bottom: 0;
    transform: translateY(${props => (props.shouldHoist ? '60px' : '200px')});
    opacity: ${props => (props.shouldShow ? 1 : 0)};
    transition: transform 0.5s, opacity 0.2s;
    z-index: 2; /* HACK because of tile name tags */
`;

const MinimizeCardsButton = styled.button`
    width: 40px;
    height: 40px;
    position: fixed;
    right: 15px;
    bottom: 15px;
    opacity: 1;
    border-radius: 50%;
    padding: 0;
    z-index: 3;
`;

export function CardHand({
    cardInfos,
}: {
    cardInfos: Array<{card: CardModel; cardContext?: CardContext; cardOwner?: PlayerState}>;
}) {
    const cards = cardInfos.map(c => c.card);
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [shouldShowCardHand, setShouldShowCardHand] = useState(true);
    const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
    const prevContainerWidth = usePrevious(containerWidth);

    // enforce at least a half CARD_WIDTH padding on each side (x2 = 1 CARD_WIDTH)
    const maximumCardWidth = Math.max(0, containerWidth - CARD_WIDTH);

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
        gapBetweenCards = (requiredCardWidth - cards.length * CARD_WIDTH) / (cards.length - 1);
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
        const yOffset = scaleYOffset * 0.4 * 100; // magic numbers
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
        return `rotate(${scaleRotation * -10}deg)`;
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
        if (containerWidth !== prevContainerWidth && containerElement) {
            setContainerWidth(containerElement.getBoundingClientRect().width);
        }
    }, [containerRef, setContainerWidth, prevContainerWidth, containerWidth]);

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
                    ? cardInfos.map(({card, cardOwner, cardContext}, cardIndex) => {
                          return (
                              <div
                                  key={card.name}
                                  style={{
                                      position: 'absolute',
                                      transform: `${getCardPosition(cardIndex)} ${getCardRotation(
                                          cardIndex
                                      )}`,
                                      boxShadow: 'rgb(191 95 63 / 0.5) 0px 0px 10px 0px',
                                      transition: 'transform 0.5s',
                                      transformOrigin: 'center',
                                      //   zIndex: cardIndex === highlightedIndex ? 1 : 0,
                                  }}
                                  onMouseEnter={() => onMouseEnter(cardIndex)}
                              >
                                  <Card
                                      card={card}
                                      cardOwner={cardOwner}
                                      cardContext={cardContext}
                                  />
                              </div>
                          );
                      })
                    : null}
            </CardHandContainer>
            <MinimizeCardsButton onClick={toggleCardDrawer}>
                {shouldShowCardHand ? '-' : '+'}
            </MinimizeCardsButton>
        </React.Fragment>
    );
}
