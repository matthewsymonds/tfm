import React, {useContext, useEffect, useRef} from 'react';
import {useLayer} from 'react-laag';
import {Options as PopoverOptions} from 'react-laag/dist/types';

export type PopoverConfig = {
    popover: React.ReactNode;
    triggerRef: React.RefObject<HTMLElement>;
    popoverOpts?: Pick<PopoverOptions, 'placement' | 'possiblePlacements'>;
} | null;

// Multiple popovers can be shown at once, but only one of any given type can be shown.
export enum PopoverType {
    CARD = 'card',
}

export type PopoverConfigByType = {[key in PopoverType]?: PopoverConfig};

export const GlobalPopoverContext = React.createContext<{
    setPopoverConfigByType: (
        type: PopoverType,
        newConfig: PopoverConfig
    ) => void;
    popoverConfigByType: PopoverConfigByType;
}>({
    setPopoverConfigByType() {
        throw new Error(
            'Must specify context value for setPopoverConfigByType'
        );
    },
    popoverConfigByType: {},
});

export function usePopoverType(type: PopoverType) {
    const {popoverConfigByType, setPopoverConfigByType} =
        useContext(GlobalPopoverContext);

    return {
        // pass null to blindly hide any popover of this type
        // prefer passing a triggerRef, so we only attempt to hide a specific popover
        hidePopover(triggerRefOrNull: React.RefObject<HTMLElement> | null) {
            if (
                triggerRefOrNull === null ||
                popoverConfigByType[type]?.triggerRef === triggerRefOrNull
            ) {
                setPopoverConfigByType(type, null);
            }
        },
        showPopover(config: PopoverConfig) {
            console.time('showPopover');
            setPopoverConfigByType(type, config);
        },
        popoverConfig: popoverConfigByType[type] ?? null,
    };
}

export function GlobalPopoverManager({}: {}) {
    const {popoverConfigByType} = useContext(GlobalPopoverContext);

    return (
        <React.Fragment>
            {Object.keys(popoverConfigByType).map(type => (
                <IndividualPopoverManager
                    key={type}
                    type={type as PopoverType}
                />
            ))}
        </React.Fragment>
    );
}

const Z_INDEX_BY_POPOVER_TYPE: {[type in PopoverType]: number} = {
    /** TOAST: 8 (see <ToastContainer /> */
    [PopoverType.CARD]: 12,
};

function IndividualPopoverManager({type}: {type: PopoverType}) {
    const {hidePopover, popoverConfig} = usePopoverType(type);

    const popover = popoverConfig?.popover;
    const triggerElement = popoverConfig?.triggerRef?.current;
    const isOpen = Boolean(popover && triggerElement);

    const {renderLayer, layerProps} = useLayer({
        isOpen,
        trigger: {
            getBounds: () => triggerElement?.getBoundingClientRect()!,
            getParent: () => triggerElement?.parentElement!,
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
                popoverConfig &&
                e.target instanceof HTMLElement &&
                !(
                    triggerElement === e.target ||
                    triggerElement?.contains(e.target)
                ) &&
                !(
                    document.querySelector(`#popoverContainer-${type}`) ===
                        e.target ||
                    document
                        .querySelector(`#popoverContainer-${type}`)
                        ?.contains(e.target)
                ) &&
                !(
                    document.querySelector('.payment-popover') === e.target ||
                    document
                        .querySelector('.payment-popover')
                        ?.contains(e.target)
                ) &&
                !(
                    e.target instanceof HTMLInputElement &&
                    Array.from(e.target.labels ?? []).some(
                        label => label === triggerElement
                    )
                )
            ) {
                if (!didImmediatelyOpenNewPopover.current) {
                    hidePopover(popoverConfig.triggerRef);
                }
                document.removeEventListener(
                    'click',
                    closePopoverAndDeregisterHandler
                );
                document.removeEventListener(
                    'touchend',
                    closePopoverAndDeregisterHandler
                );
            }
        }

        if (popoverConfig) {
            didImmediatelyOpenNewPopover.current = true;
            window.requestAnimationFrame(() => {
                didImmediatelyOpenNewPopover.current = false;
            });
            document.addEventListener(
                'click',
                closePopoverAndDeregisterHandler
            );
            document.addEventListener(
                'touchend',
                closePopoverAndDeregisterHandler
            );
        }

        return () => {
            document.removeEventListener(
                'click',
                closePopoverAndDeregisterHandler
            );
            document.removeEventListener(
                'touchend',
                closePopoverAndDeregisterHandler
            );
        };
    }, [popoverConfig]);

    return renderLayer(
        <div
            {...layerProps}
            id={`popoverContainer-${type}`}
            style={{zIndex: Z_INDEX_BY_POPOVER_TYPE[type], ...layerProps.style}}
        >
            {popover}
        </div>
    );
}
