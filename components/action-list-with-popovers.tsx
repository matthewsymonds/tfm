import {colors} from 'components/ui';
import {useComponentId} from 'hooks/use-component-id';
import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {useRect} from 'react-use-rect';

const OuterWrapper = styled.div`
    display: flex;
    height: 100%;
    flex-direction: column;
    align-items: stretch;
    margin: 0px;
`;

// This is pretty hard-coded
export function usePositionOnHover(showAbove: boolean) {
    const [ref, rect] = useRect();

    let windowScrollY = 0;
    if (typeof window !== 'undefined') {
        windowScrollY = window.scrollY;
    }
    const topRelativeToWindow = rect.top + windowScrollY;

    let top, left;
    if (showAbove) {
        top = topRelativeToWindow - 230; // 225 card height + some buffer
        left = rect.left - 82; // (half card width 100 - half button width 20 + half boxshadow width 2)
    } else {
        top = topRelativeToWindow - 50; // arbitrary
        left = rect.left - 205; // 200 card width + some buffer
    }

    return {
        ref,
        top,
        left,
    };
}

export default function ActionListWithPopovers<T>({
    actions,
    ActionComponent,
    ActionPopoverComponent,
    style,
    emphasizeOnHover,
    isVertical,
}: {
    actions: Array<T>;
    ActionComponent: React.FunctionComponent<{
        action: T;
    }>;
    ActionPopoverComponent: React.FunctionComponent<{
        action: T;
        closePopover: () => void;
    }>;
    style?: React.CSSProperties;
    emphasizeOnHover: (t: T) => boolean;
    isVertical: boolean;
}) {
    const [pinnedAction, setPinnedAction] = useState<T | null>(null);

    // TODO: hoist this to a context so we can be globally aware of what popovers are
    // open or not.
    useEffect(() => {
        const globalHandlerToClearPinnedPopover = e => {
            setPinnedAction(null);
        };
        window.addEventListener('click', globalHandlerToClearPinnedPopover);
        return () => {
            window.removeEventListener('click', globalHandlerToClearPinnedPopover);
        };
    }, []);

    return (
        <OuterWrapper style={style}>
            {actions.map((action, index) => {
                return (
                    <ActionWithPopover<T>
                        key={index}
                        action={action}
                        emphasizeOnHover={emphasizeOnHover(action)}
                        isVertical={isVertical}
                        isPinned={pinnedAction === action}
                        setPinnedAction={setPinnedAction}
                        ActionComponent={ActionComponent}
                        ActionPopoverComponent={ActionPopoverComponent}
                    />
                );
            })}
        </OuterWrapper>
    );
}

function ActionWithPopover<T>({
    action,
    ActionComponent,
    ActionPopoverComponent,
    emphasizeOnHover,
    isVertical,
    isPinned,
    setPinnedAction,
}: {
    action: T;
    ActionComponent: React.FunctionComponent<{
        action: T;
    }>;
    ActionPopoverComponent: React.FunctionComponent<{
        action: T;
        closePopover: () => void;
    }>;
    emphasizeOnHover: boolean;
    isVertical: boolean;
    isPinned: boolean;
    setPinnedAction: (action: T | null) => void;
}) {
    const [isHovering, setIsHovering] = useState(false);
    const {ref, top, left} = usePositionOnHover(!isVertical);
    const popoverId = useComponentId();

    function _setIsHoveringToTrue() {
        if (!isHovering) {
            setIsHovering(true);
        }
        if (!isPinned) {
            setPinnedAction(null);
        }
    }

    return (
        <React.Fragment>
            <StylizedActionWrapper
                ref={ref}
                id={`${action}`}
                emphasizeOnHover={emphasizeOnHover}
                isHovering={isHovering || isPinned}
                isVertical={isVertical}
                onClick={e => {
                    setPinnedAction(action);
                    e.stopPropagation();
                }}
                onMouseEnter={_setIsHoveringToTrue}
                onMouseMove={_setIsHoveringToTrue}
                onMouseLeave={(e: React.MouseEvent) => {
                    if ((e?.relatedTarget as Element)?.parentElement?.id !== popoverId) {
                        setIsHovering(false);
                    }
                }}
            >
                <ActionComponent action={action} />
            </StylizedActionWrapper>
            {(isHovering || isPinned) && (
                <div
                    id={popoverId}
                    onMouseLeave={() => setIsHovering(false)}
                    style={{
                        position: 'absolute',
                        zIndex: 10,
                        left,
                        top,
                    }}
                >
                    <ActionPopoverComponent
                        action={action}
                        closePopover={() => {
                            setIsHovering(false);
                            setPinnedAction(null);
                        }}
                    />
                </div>
            )}
        </React.Fragment>
    );
}

const StylizedActionWrapper = styled.div<{
    emphasizeOnHover: boolean;
    isVertical: boolean;
    isHovering: boolean;
}>`
    display: flex;
    position: relative;
    align-items: center;
    justify-content: flex-end;
    ${props => (props.isVertical ? 'margin-bottom: 4px;' : 'margin-right: 4px;')}
    user-select: none;
    opacity: ${props => (props.emphasizeOnHover ? 1 : 0.5)};

    &:before {
        content: '';
        transition: background-color 250ms, box-shadow 250ms;
        position: absolute;
        height: 100%;
        width: 100%;
        z-index: -1;
        border-radius: 3px;
        background-color: ${props => (props.isHovering ? colors.LIGHT_BG : 'none')};
        box-shadow: ${props =>
            props.emphasizeOnHover && props.isHovering
                ? 'rgb(0 0 0 / 1) 4px 6px 6px -1px'
                : 'none'};
    }
`;
