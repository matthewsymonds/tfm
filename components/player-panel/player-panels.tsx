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
    const gameName = useTypedSelector(state => state.name);
    const [topIndex, setTopIndex] = useState<number>(playerIndex);

    useEffect(() => {
        const handler = () => {
            const newIndex = swiper?.activeIndex ?? topIndex;
            setTopIndex(newIndex);
        };
        swiper?.on('slideChange', handler);
        return () => swiper?.off('slideChange', handler);
    }, [swiper, gameName]);

    useEffect(() => {
        const element: HTMLDivElement | null = document.querySelector(
            '#player-board-unique-' + topIndex
        );
        const parent = element?.parentElement;
        if (element && parent) {
            const scrollLeft =
                element.offsetLeft -
                parent.offsetWidth / 2 +
                element.offsetWidth / 2;
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

    const open = topIndex != null;

    const [overflow, setOverflow] = useState('hidden');

    useEffect(() => {
        if (open) {
            setTimeout(() => {
                setOverflow('auto');
            }, 200);
        } else {
            setOverflow('hidden');
        }
    }, [open]);

    return (
        <Box position="relative">
            <PlayerBoardsContainer overflowX="auto" width="100%">
                {players.map((player, i) => (
                    <Box
                        key={i}
                        id={'player-board-unique-' + i}
                        className={`player-board ${
                            i === 0
                                ? 'first'
                                : i === players.length - 1
                                ? 'last'
                                : ''
                        }`}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: 10,
                        }}
                        onClick={() => {
                            swiper?.slideTo(i);
                        }}
                    >
                        <PlayerTopPanel
                            player={player}
                            isSelected={topIndex === i}
                        />
                    </Box>
                ))}
            </PlayerBoardsContainer>
            <Box display={topIndex != null ? 'initial' : 'none'}>
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
                                <PlayerBottomPanel
                                    player={player}
                                    isSelected={isActive}
                                />
                            )}
                        </SwiperSlide>
                    ))}
                </Swiper>
            </Box>
        </Box>
    );
};
