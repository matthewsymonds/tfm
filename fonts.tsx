import {useEffect, useRef} from 'react';

function preloadSupported() {
    if (typeof document === 'undefined') return false;
    var relListEl = document.createElement('link');
    const relList = relListEl?.relList;
    return !!(relList && relList.supports && relList.supports('preload'));
}

export const Fonts = () => {
    const ref = useRef<HTMLLinkElement>(null);
    useEffect(() => {
        if (!preloadSupported() && ref.current) {
            ref.current.rel = 'stylesheet';
        }
    }, [ref.current]);
    return (
        <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link
                ref={ref}
                href="https://fonts.googleapis.com/css2?family=Ubuntu+Condensed:wght@400;500;600;700;900&family=Open+Sans:wght@400;500;600;700;900"
                rel="preload"
                id="preload-stylesheet"
                as="style"
                onLoad={function () {
                    const element = document.querySelector('#preload-stylesheet');
                    if (element && element instanceof HTMLLinkElement) {
                        element.rel = 'stylesheet';
                    }
                }}
                crossOrigin="anonymous"
            />
        </>
    );
};
