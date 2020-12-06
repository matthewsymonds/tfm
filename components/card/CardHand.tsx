import {Card, CARD_HEIGHT, CARD_WIDTH} from 'components/card/Card';
import React, {useEffect, useRef, useState} from 'react';
import {throttle} from 'throttle-debounce';
import styled from 'styled-components';
import {Card as CardModel} from 'models/card';

function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
}

const MINIMUM_OVERLAP_PERCENT = 0.5; // e.g. cards will at least overlap by 50%. May be more if there are more cards

const CardHandContainer = styled.div<{shouldShow: boolean}>`
    width: 100%;
    height: ${CARD_HEIGHT}px;
    position: fixed;
    bottom: -100px;
    bottom: ${props => (props.shouldShow ? '-60px' : '-200px')};
    transition: bottom 0.5s;
    z-index: 2; /* HACK because of tile name tags */
`;

export function CardHand({
    cardInfos,
}: {
    cardInfos: Array<{card: CardModel; button?: React.ReactNode}>;
}) {
    const cards = cardInfos.map(c => c.card);
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);
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
    const gapBetweenCards = (requiredCardWidth - cards.length * CARD_WIDTH) / (cards.length - 1);

    // Chock full of magic numbers
    function getCardPosition(cardIndex: number) {
        let xOffset = sidePadding + cardIndex * (CARD_WIDTH + gapBetweenCards);
        const isHighlighted = cardIndex === highlightedIndex;
        if (highlightedIndex !== null && !isHighlighted) {
            // if another card is highlighted, push cards away from the highlighted card
            // this math is weird, it assumes gapBetweenCards is negative, it works so /shrug
            const bonusCardPadding = -20;
            if (highlightedIndex < cardIndex) {
                xOffset += -1 * (gapBetweenCards + bonusCardPadding);
            } else {
                xOffset += gapBetweenCards + bonusCardPadding;
            }
        }

        const normalizedHalf = (cards.length - 1) / 2;
        const distanceToMiddle = Math.abs(normalizedHalf - cardIndex);
        const scaleYOffset = distanceToMiddle / normalizedHalf;
        const yOffset = Math.pow(scaleYOffset, 1.5) * 100; // magic numbers

        return `translate(${xOffset}px, ${isHighlighted ? '-100' : yOffset}px)`;
    }

    // Chock full of magic numbers
    function getCardRotation(cardIndex: number) {
        const isHighlighted = cardIndex === highlightedIndex;
        if (isHighlighted) {
            return 'rotate(0)';
        }

        const normalizedHalf = (cards.length - 1) / 2;
        const distanceToMiddle = normalizedHalf - cardIndex;
        const scaleRotation = distanceToMiddle / normalizedHalf;

        return `rotate(${scaleRotation * -20}deg)`;
    }

    function onMouseEnter(cardIndex: number) {
        setHighlightedIndex(cardIndex);
    }

    function onMouseLeave() {
        setHighlightedIndex(null);
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
        <CardHandContainer
            ref={containerRef}
            onMouseLeave={onMouseLeave}
            shouldShow={typeof highlightedIndex === 'number'}
        >
            {cardInfos.map(({card, button}, cardIndex) => {
                return (
                    <div
                        key={cardIndex}
                        style={{
                            position: 'absolute',
                            transform: `${getCardPosition(cardIndex)} ${getCardRotation(
                                cardIndex
                            )}`,
                            transition: 'transform 0.5s',
                            transformOrigin: 'center',
                        }}
                        onMouseEnter={() => onMouseEnter(cardIndex)}
                    >
                        <Card card={card} button={button} />
                    </div>
                );
            })}
        </CardHandContainer>
    );
}
