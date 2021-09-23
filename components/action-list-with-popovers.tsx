import {colors} from 'components/ui';
import {GlobalPopoverContext} from 'context/global-popover-context';
import {useComponentId} from 'hooks/use-component-id';
import React, {useContext, useEffect, useRef, useState} from 'react';
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
    overflow-x: auto;
    padding-bottom: 4px;
    display: flex;
    justify-content: center;
    @media (max-width: 895px) {
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

function ActionWithPopover<T>({
    action,
    ActionComponent,
    ActionPopoverComponent,
    emphasizeOnHover,
    isVertical,
    popoverPlacement,
}: ActionWithPopoverProps<T>) {
    const {setPopoverConfig, popoverConfig} = useContext(GlobalPopoverContext);
    const ref = useRef<HTMLDivElement>(null);

    return (
        <Box
            marginRight={isVertical ? undefined : '4px'}
            marginBottom={isVertical ? '4px' : undefined}
        >
            <Flex
                alignItems="center"
                ref={ref}
                justifyContent="flex-end"
                onMouseEnter={() => {
                    setPopoverConfig({
                        popover: <ActionPopoverComponent action={action} />,
                        triggerRef: ref,
                        popoverOpts: {
                            placement: popoverPlacement,
                        },
                    });
                }}
            >
                <StylizedActionWrapper
                    id={`${action}`}
                    emphasizeOnHover={emphasizeOnHover}
                    isHovering={
                        popoverConfig?.triggerRef !== null && popoverConfig?.triggerRef === ref
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
