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

const PlayerBoardsContainer = styled(Flex)``;

export const PlayerPanels = () => {
    const players = useTypedSelector(state => state.players);
    const loggedInPlayer = useLoggedInPlayer();
    const [swiper, setSwiper] = useState<SwiperCore | null>(null);
    const playerIndex = useTypedSelector(state => loggedInPlayer.index);
    const [topIndex, setTopIndex] = useState(playerIndex);

    useEffect(() => {
        setTopIndex(playerIndex);
    }, [loggedInPlayer.index]);

    useEffect(() => {
        const handler = () => {
            const newIndex = swiper?.activeIndex ?? topIndex;
            setTopIndex(newIndex);
        };
        swiper?.on('slideChange', handler);
        return () => swiper?.off('slideChange', handler);
    }, [swiper]);

    useEffect(() => {
        const element: HTMLDivElement | null = document.querySelector(
            '#player-board-unique-' + topIndex
        );
        const parent = element?.parentElement;
        if (element && parent) {
            const scrollLeft =
                element.offsetLeft - parent.offsetWidth / 2 + element.offsetWidth / 2;
            parent.scrollTo({left: scrollLeft, behavior: 'smooth'});
        }
    }, [topIndex]);

    const swiperProps = {
        scrollbar: {draggable: true},
        centeredSlides: false,
        mousewheel: {
            forceToAxis: true,
        },
        initialSlide: loggedInPlayer.index,
        modules: [Controller, Mousewheel],
    };

    return (
        <Box>
            <PlayerBoardsContainer overflowX="auto" width="100%" id="player-boards-container">
                {players.map((player, i) => (
                    <Box
                        key={i}
                        id={'player-board-unique-' + i}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: i === 0 ? 0 : 8,
                            marginRight: i === players.length - 1 ? 0 : 8,
                            marginTop: 10,
                            marginBottom: 8,
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
                        style={{maxWidth: '804px'}}
                    >
                        {({isActive}) => (
                            <PlayerBottomPanel player={player} isSelected={isActive} />
                        )}
                    </SwiperSlide>
                ))}
            </Swiper>
        </Box>
    );
};
