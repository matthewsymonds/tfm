import React, {useContext, useEffect, useRef, useState} from 'react';
import {useLayer} from 'react-laag';
import {Options as PopoverOptions} from 'react-laag/dist/types';

export type PopoverConfig = {
    popover: React.ReactNode;
    triggerRef: React.RefObject<HTMLElement>;
    popoverOpts?: Pick<PopoverOptions, 'placement' | 'onDisappear' | 'onOutsideClick'>;
} | null;

export const GlobalPopoverContext = React.createContext<{
    setPopoverConfig: (newConfig: PopoverConfig) => void;
    popoverConfig: PopoverConfig | null;
}>({setPopoverConfig() {}, popoverConfig: null});

export function GlobalPopoverManager({}: {}) {
    const {popoverConfig, setPopoverConfig} = useContext(GlobalPopoverContext);

    const popover = popoverConfig?.popover;
    const triggerElement = popoverConfig?.triggerRef?.current;
    const isOpen = Boolean(popover && triggerElement);

    const {renderLayer, layerProps} = useLayer({
        isOpen,
        trigger: {
            getBounds: () => triggerElement?.getBoundingClientRect()!,
            getParent: () => triggerElement?.parentElement!,
        },
        onOutsideClick: popoverConfig?.popoverOpts?.onOutsideClick
            ? popoverConfig?.popoverOpts?.onOutsideClick
            : () => setPopoverConfig(null),
        onDisappear: popoverConfig?.popoverOpts?.onDisappear
            ? popoverConfig?.popoverOpts?.onDisappear
            : () => setPopoverConfig(null),
        overflowContainer: true,
        auto: true, // automatically find the best placement
        placement: popoverConfig?.popoverOpts?.placement ?? 'top-end', // we prefer to place the menu "top-end"
        triggerOffset: 8, // keep some distance to the trigger
        containerOffset: 16, // give the menu some room to breath relative to the container
        arrowOffset: 16, // let the arrow have some room to breath also
    });

    return renderLayer(
        <div {...layerProps} style={{zIndex: 10, ...layerProps.style}}>
            {popover}
        </div>
    );
}
