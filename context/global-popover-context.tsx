import {Box} from 'components/box';
import React, {useContext} from 'react';
import ReactDOM from 'react-dom';

export type PopoverConfig = {
    popover: React.ReactNode;
    rootRef: React.RefObject<HTMLElement> | null;
};

export const GlobalPopoverContext = React.createContext<{
    setPopoverConfig: (newConfig: PopoverConfig) => void;
    popoverConfig: PopoverConfig | null;
}>({setPopoverConfig() {}, popoverConfig: null});

export function GlobalPopoverManager() {
    const globalPopoverContext = useContext(GlobalPopoverContext);

    const popover = globalPopoverContext.popoverConfig?.popover;
    const rootElement = globalPopoverContext.popoverConfig?.rootRef?.current;

    if (!popover || !rootElement) {
        return null;
    }
    const root = document.querySelector('#root');

    // position math
    const position = rootElement.getBoundingClientRect();
    const showAbove = position.top > 320;
    let windowScrollY = 0;
    if (typeof window !== 'undefined') {
        windowScrollY = window.scrollY;
    }
    const topRelativeToWindow = position.top + windowScrollY;
    const top = showAbove ? topRelativeToWindow - 310 : topRelativeToWindow + 30;
    let windowInnerWidth = 0;
    if (typeof window !== 'undefined') {
        windowInnerWidth = window.innerWidth;
    }
    const left = Math.min(position.left, windowInnerWidth - 230);
    // end position math

    return ReactDOM.createPortal(
        <Box position="absolute" top={`${top}px`} left={`${left}px`} zIndex={3}>
            {popover}
        </Box>,
        root
    );
}
