import React from 'react';
import * as RadixTooltip from '@radix-ui/react-tooltip';

type TooltipProps = React.PropsWithChildren<{
    content: React.ReactNode;
    delayDuration?: number;
    isBespoke?: boolean;
    side?: 'top' | 'right' | 'bottom' | 'left';
    sideOffset?: number;
    align?: 'start' | 'center' | 'end';
    alignOffset?: number;
}>;

export const Tooltip = (props: TooltipProps) => {
    return (
        <RadixTooltip.Root delayDuration={props.delayDuration}>
            <RadixTooltip.Trigger asChild>
                {props.children}
            </RadixTooltip.Trigger>
            <RadixTooltip.Portal>
                <RadixTooltip.Content
                    side={props.side}
                    align={props.align}
                    sideOffset={props.sideOffset}
                    alignOffset={props.alignOffset}
                    // onPointerDownOutside={e => e.preventDefault()}
                    className={
                        props.isBespoke
                            ? ''
                            : 'px-2 py-1 shadow-md border border-white bg-stone-300 rounded max-w-[160px] text-xs'
                    }
                >
                    {props.content}
                </RadixTooltip.Content>
            </RadixTooltip.Portal>
        </RadixTooltip.Root>
    );
};

export const MaybeTooltip = (
    props: TooltipProps & {shouldShowTooltip: boolean}
) => {
    if (props.shouldShowTooltip) {
        return <Tooltip {...props}>{props.children}</Tooltip>;
    }

    return <React.Fragment>{props.children}</React.Fragment>;
};
