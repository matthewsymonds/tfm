import {useEffect, useState} from 'react';

export function useWindowWidth() {
    if (typeof window === 'undefined') return 0;
    const [windowWidth, setWindowWidth] = useState<number>(0);
    useEffect(() => {
        function handleResize() {
            setWindowWidth(window.innerWidth);
        }
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return windowWidth;
}
