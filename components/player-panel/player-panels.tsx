import {Box, Flex} from 'components/box';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import React, {useEffect, useState} from 'react';
import {useTypedSelector} from 'reducer';
import styled from 'styled-components';
import SwiperCore, {Controller, Mousewheel} from 'swiper';
import 'swiper/css';
import {Swiper, SwiperSlide} from 'swiper/react';
import {PlayerBottomPanel} from './player-bottom-panel';
import {PlayerTopPanel} from './player-top-panel';

const PlayerBoardsContainer = styled(Flex)`
    &::before,
    &::after {
        content: '';
        flex: 1;
    }
`;

export const PlayerPanels = () => {
    const players = useTypedSelector(state => state.players);
    const loggedInPlayer = useLoggedInPlayer();
    const [swiper, setSwiper] = useState<SwiperCore | null>(null);
    const [topIndex, setTopIndex] = useState(loggedInPlayer.index);

    useEffect(() => {
        const handler = () => {
            const newIndex = swiper?.activeIndex ?? topIndex;
            setTopIndex(newIndex);
            const element: HTMLDivElement | null = document.querySelector(
                '#player-board-unique-' + newIndex
            );
            if (element) {
                element.scrollIntoView({behavior: 'smooth', inline: 'center', block: 'nearest'});
            }
        };
        swiper?.on('slideChange', handler);
        return () => swiper?.off('slideChange', handler);
    }, [swiper]);

    const swiperProps = {
        scrollbar: {draggable: true},
        spaceBetween: 16,
        centeredSlides: true,
        mousewheel: {
            forceToAxis: true,
        },
        initialSlide: loggedInPlayer.index,
        modules: [Controller, Mousewheel],
    };

    return (
        <div>
            <PlayerBoardsContainer overflowX="auto" width="100%">
                {players.map((player, i) => (
                    <Box
                        key={i}
                        id={'player-board-unique-' + i}
                        style={{
                            width: 264,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onClick={() => {
                            swiper?.slideTo(i);
                        }}
                    >
                        <PlayerTopPanel player={player} isSelected={topIndex === i} />
                    </Box>
                ))}
            </PlayerBoardsContainer>

            <Swiper
                controller={{control: swiper ?? undefined}}
                onSwiper={setSwiper}
                slidesPerView="auto"
                {...swiperProps}
            >
                {players.map((player, i) => (
                    <SwiperSlide
                        onClick={() => swiper?.slideTo(player.index)}
                        key={i}
                        style={{
                            maxWidth: 929,
                        }}
                    >
                        {({isActive}) => (
                            <PlayerBottomPanel player={player} isSelected={isActive} />
                        )}
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};
