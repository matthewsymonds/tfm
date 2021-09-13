import {colors} from 'components/ui';
import {useComponentId} from 'hooks/use-component-id';
import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {Flex} from './box';

const OuterWrapper = styled.div`
    display: flex;
    height: 100%;
    flex-direction: column;
    align-items: stretch;
    margin: 0px;
    @media (max-width: 895px) {
        flex-direction: row;
    }
`;

const ScrollingOuterWrapper = styled.div`
    width: 100%;
    overflow-x: auto;
    display: flex;
    justify-content: center;
`;

export default function ActionListWithPopovers<T>({
    actions,
    ActionComponent,
    ActionPopoverComponent,
    style,
    emphasizeOnHover,
    isVertical,
    setBoundaries = true,
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
    setBoundaries?: boolean;
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
        <ScrollingOuterWrapper>
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
                            isFirst={!isVertical && setBoundaries && index === 0}
                            isLast={!isVertical && setBoundaries && index === actions.length - 1}
                        />
                    );
                })}
            </OuterWrapper>
        </ScrollingOuterWrapper>
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
    isFirst,
    isLast,
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
    isFirst: boolean;
    isLast: boolean;
}) {
    const [isHovering, setIsHovering] = useState(false);
    const popoverId = useComponentId();

    function _setIsHoveringToTrue() {
        if (!isHovering) {
            setIsHovering(true);
        }
        if (!isPinned) {
            setPinnedAction(null);
        }
    }

    const translateX = isVertical ? -100 : isFirst ? 0 : isLast ? -100 : -50;
    const translateY = !isVertical ? -100 : isFirst ? 0 : isLast ? -100 : -50;

    const left = isVertical ? 0 : isFirst ? 0 : isLast ? 100 : 50;
    const top = !isVertical ? 0 : isFirst ? 0 : isLast ? 100 : 50;

    return (
        <Flex
            alignItems="center"
            justifyContent="flex-end"
            onMouseEnter={_setIsHoveringToTrue}
            onMouseMove={_setIsHoveringToTrue}
            onMouseLeave={(e: React.MouseEvent) => {
                if ((e?.relatedTarget as Element)?.parentElement?.id !== popoverId) {
                    setIsHovering(false);
                }
            }}
            paddingLeft={isVertical ? '4px' : 0}
            paddingTop={isVertical ? 0 : '4px'}
            onClick={e => {
                setPinnedAction(action);
                e.stopPropagation();
            }}
        >
            <StylizedActionWrapper
                id={`${action}`}
                emphasizeOnHover={emphasizeOnHover}
                isHovering={isHovering || isPinned}
                isVertical={isVertical}
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
                        left: `${left}%`,
                        top: `${top}%`,
                        transform: `translate(${translateX}%, ${translateY}%)`,
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
        </Flex>
    );
}

const StylizedActionWrapper = styled.div<{
    emphasizeOnHover: boolean;
    isVertical: boolean;
    isHovering: boolean;
}>`
    ${props => (props.isVertical ? 'margin-bottom: 4px;' : 'margin-right: 4px;')}
    user-select: none;
    opacity: ${props => (props.emphasizeOnHover ? 1 : 0.5)};

    transition: background-color 250ms, box-shadow 250ms;
    border-radius: 3px;
    background-color: ${props => (props.isHovering ? colors.LIGHT_BG : 'none')};

    box-shadow: ${props =>
        props.emphasizeOnHover && props.isHovering ? 'rgb(0 0 0 / 1) 4px 6px 6px -1px' : 'none'};
`;
