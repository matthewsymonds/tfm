import {useState} from 'react';
import {useTypedSelector} from 'reducer';
import SwiperCore, {Controller, Mousewheel} from 'swiper';
import 'swiper/css';
import {Swiper, SwiperSlide} from 'swiper/react';
import {PlayerBottomPanel} from './player-bottom-panel';
import {PlayerTopPanel} from './player-top-panel';

export const PlayerPanels = () => {
    const players = useTypedSelector(state => state.players);
    const [topSwiper, setTopSwiper] = useState<SwiperCore | null>(null);
    const [bottomSwiper, setBottomSwiper] = useState<SwiperCore | null>(null);
    const [sharedSwiperProps] = useState<React.ComponentProps<typeof Swiper>>(() => ({
        scrollbar: {draggable: true},
        spaceBetween: 16,
        centeredSlides: true,
        mousewheel: {
            forceToAxis: true,
        },
        modules: [Controller, Mousewheel],
    }));

    return (
        <div>
            <Swiper
                controller={{control: bottomSwiper ?? undefined}}
                onSwiper={setTopSwiper}
                slidesPerView="auto"
                {...sharedSwiperProps}
            >
                {players.map((player, i) => (
                    <SwiperSlide
                        onClick={() => topSwiper?.slideTo(player.index)}
                        key={i}
                        style={{
                            width: 252,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {({isActive}) => <PlayerTopPanel player={player} isSelected={isActive} />}
                    </SwiperSlide>
                ))}
            </Swiper>
            <Swiper
                controller={{control: topSwiper ?? undefined}}
                onSwiper={setBottomSwiper}
                slidesPerView="auto"
                {...sharedSwiperProps}
            >
                {players.map((player, i) => (
                    <SwiperSlide
                        onClick={() => topSwiper?.slideTo(player.index)}
                        key={i}
                        style={{
                            maxWidth: 800,
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
