import {colors} from 'components/ui';
import {GlobalPopoverContext, PopoverType, usePopoverType} from 'context/global-popover-context';
import React, {useContext, useEffect, useRef} from 'react';
import {useHover} from 'react-laag';
import {PlacementType} from 'react-laag/dist/PlacementType';
import styled from 'styled-components';
import {Box, Flex} from './box';

const OuterWrapper = styled.div`
    display: flex;
    height: 100%;
    flex-direction: column;
    width: 100%;
    align-items: stretch;
    margin: 0px;
    @media (max-width: 895px) {
        flex-direction: row;
    }
`;

const ScrollingOuterWrapper = styled.div`
    width: 100%;
    min-width: 96px;
    overflow-x: auto;
    padding-bottom: 4px;
    display: flex;
    justify-content: center;
    @media (max-width: 895px) {
        min-width: initial;
        justify-content: flex-start;
    }
`;

type ActionListWithPopoversProps<T> = {
    actions: Array<T>;
    ActionComponent: React.FunctionComponent<{action: T}>;
    ActionPopoverComponent: React.FunctionComponent<{action: T}>;
    style?: React.CSSProperties;
    emphasizeOnHover: (t: T) => boolean;
    isVertical: boolean;
    popoverPlacement?: PlacementType;
};

export default function ActionListWithPopovers<T>({
    actions,
    ActionComponent,
    ActionPopoverComponent,
    style,
    emphasizeOnHover,
    isVertical,
    popoverPlacement,
}: ActionListWithPopoversProps<T>) {
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
                            ActionComponent={ActionComponent}
                            ActionPopoverComponent={ActionPopoverComponent}
                            popoverPlacement={popoverPlacement}
                        />
                    );
                })}
            </OuterWrapper>
        </ScrollingOuterWrapper>
    );
}

type ActionWithPopoverProps<T> = {
    action: T;
    ActionComponent: React.FunctionComponent<{action: T}>;
    ActionPopoverComponent: React.FunctionComponent<{action: T}>;
    emphasizeOnHover: boolean;
    isVertical: boolean;
    popoverPlacement?: PlacementType;
};

function ActionWithPopover<T extends {}>({
    action,
    ActionComponent,
    ActionPopoverComponent,
    emphasizeOnHover,
    isVertical,
    popoverPlacement,
}: ActionWithPopoverProps<T>) {
    const {showPopover, popoverConfig} = usePopoverType(PopoverType.ACTION_LIST_ITEM);
    const triggerRef = useRef<HTMLDivElement>(null);
    const [isOver, hoverProps] = useHover({delayEnter: 0, delayLeave: 0});

    useEffect(() => {
        if (isOver) {
            showPopover({
                popover: <ActionPopoverComponent action={action} />,
                triggerRef,
                popoverOpts: {
                    placement: popoverPlacement,
                },
            });
        }
        // we explicitly don't hide popover onMouseLeave here.
        // the popover may contain an interactive component, so we want
        // the user to be able to move their mouse into the popover and
        // interact. the global key handle implemented by GlobalPopoverContext
        // will still handle closing it out external clicks, though.
    }, [isOver]);

    return (
        <Box
            marginRight={isVertical ? undefined : '4px'}
            marginBottom={isVertical ? '4px' : undefined}
        >
            <Flex alignItems="center" ref={triggerRef} justifyContent="flex-end" {...hoverProps}>
                <StylizedActionWrapper
                    id={`${JSON.stringify(action)}`}
                    emphasizeOnHover={emphasizeOnHover}
                    isHovering={
                        popoverConfig?.triggerRef !== null &&
                        popoverConfig?.triggerRef === triggerRef
                    }
                >
                    <ActionComponent action={action} />
                </StylizedActionWrapper>
            </Flex>
        </Box>
    );
}

const StylizedActionWrapper = styled.div<{
    emphasizeOnHover: boolean;
    isHovering: boolean;
}>`
    user-select: none;
    opacity: ${props => (props.emphasizeOnHover ? 1 : 0.5)};

    transition: background-color 250ms, box-shadow 250ms;
    border-radius: 3px;
    background-color: ${props => (props.isHovering ? colors.LIGHT_BG : 'none')};

    box-shadow: ${props =>
        props.emphasizeOnHover && props.isHovering ? 'rgb(0 0 0 / 1) 4px 6px 6px -1px' : 'none'};
`;
