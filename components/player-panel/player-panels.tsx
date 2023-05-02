import {Box, Flex} from 'components/box';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import {useEffect, useRef, useState} from 'react';
import {useTypedSelector} from 'reducer';
import styled from 'styled-components';
import SwiperCore, {Controller, Mousewheel} from 'swiper';
import 'swiper/css';
import {Swiper, SwiperSlide} from 'swiper/react';
import {PlayerBottomPanel} from './player-bottom-panel';
import {PlayerTopPanel} from './player-top-panel';

const PlayerBoardsContainer = styled(Flex)`
    margin-top: -8px;
    @media (max-width: 1500px) {
        margin-top: 0;
    }
`;

export const PlayerPanels = () => {
    const players = useTypedSelector(state => state.players);
    const loggedInPlayer = useLoggedInPlayer();
    const [swiper, setSwiper] = useState<SwiperCore | null>(null);
    const playerIndex = useTypedSelector(state => loggedInPlayer.index);
    const gameName = useTypedSelector(state => state.name);
    const [topIndex, setTopIndex] = useState<number>(playerIndex);
    const scrollRef = useRef<HTMLElement>(null);
    const innerScrollRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const handler = () => {
            const newIndex = swiper?.activeIndex ?? topIndex;
            setTopIndex(newIndex);
        };
        swiper?.on('slideChange', handler);
        return () => swiper?.off('slideChange', handler);
    }, [swiper, gameName]);

    useEffect(() => {
        if (scrollRef?.current && innerScrollRef?.current) {
            const scrollLeft =
                innerScrollRef.current.offsetLeft -
                scrollRef.current.offsetWidth / 2 +
                innerScrollRef.current.offsetWidth / 2;
            scrollRef.current.scrollTo({left: scrollLeft, behavior: 'smooth'});
        }
    }, [topIndex]);

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
            <PlayerBoardsContainer
                ref={scrollRef}
                overflowX="auto"
                className="w-full overflow-x-auto no-scrollbar"
            >
                {players.map((player, i) => (
                    <Box
                        key={i}
                        ref={i === topIndex ? innerScrollRef : null}
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
                    centeredSlides={false}
                    controller={{control: swiper ?? undefined}}
                    initialSlide={loggedInPlayer.index}
                    onSwiper={setSwiper}
                    modules={[Controller, Mousewheel]}
                    mousewheel={{
                        forceToAxis: true,
                    }}
                    slidesPerView={1}
                    scrollbar={{draggable: true, hide: true}}
                >
                    {players.map((player, i) => (
                        <SwiperSlide
                            onClick={() => swiper?.slideTo(player.index)}
                            key={i}
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
