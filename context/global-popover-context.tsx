import React, {useContext, useEffect, useRef} from 'react';
import {useLayer} from 'react-laag';
import {Options as PopoverOptions} from 'react-laag/dist/types';

export type PopoverConfig = {
    popover: React.ReactNode;
    triggerRef: React.RefObject<HTMLElement>;
    popoverOpts?: Pick<PopoverOptions, 'placement' | 'onDisappear' | 'possiblePlacements'>;
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
        onDisappear: popoverConfig?.popoverOpts?.onDisappear
            ? popoverConfig?.popoverOpts?.onDisappear
            : () => {
                  setPopoverConfig(null);
              },
        overflowContainer: true,
        auto: true, // automatically find the best placement
        placement: popoverConfig?.popoverOpts?.placement ?? 'top-end', // we prefer to place the menu "top-end"
        possiblePlacements: popoverConfig?.popoverOpts?.possiblePlacements, // we prefer to place the menu "top-end"
        triggerOffset: 8, // keep some distance to the trigger
        containerOffset: 16, // give the menu some room to breath relative to the container
        arrowOffset: 16, // let the arrow have some room to breath also
    });

    // HACK to handle when one popover is open and a user clicks another.
    // We don't want to clear the config in that case, because we likely will end up clearing
    // the one we just set. There's probably a cleaner way to do this but this works for now.
    const didImmediatelyOpenNewPopover = useRef<boolean>(false);

    useEffect(() => {
        function closePopoverAndDeregisterHandler(e: MouseEvent) {
            if (
                e.target instanceof HTMLElement &&
                !(triggerElement === e.target || triggerElement?.contains(e.target)) &&
                !(
                    document.querySelector('#popoverContainer') === e.target ||
                    document.querySelector('#popoverContainer')?.contains(e.target)
                ) &&
                !(
                    document.querySelector('.payment-popover') === e.target ||
                    document.querySelector('.payment-popover')?.contains(e.target)
                )
            ) {
                if (!didImmediatelyOpenNewPopover.current) {
                    setPopoverConfig(null);
                }
                document.removeEventListener('click', closePopoverAndDeregisterHandler);
            }
        }

        if (popoverConfig) {
            didImmediatelyOpenNewPopover.current = true;
            window.requestAnimationFrame(() => {
                didImmediatelyOpenNewPopover.current = false;
            });
            document.addEventListener('click', closePopoverAndDeregisterHandler);
        }
    }, [popoverConfig]);

    return renderLayer(
        <div {...layerProps} id={'popoverContainer'} style={{zIndex: 10, ...layerProps.style}}>
            {popover}
        </div>
    );
}
