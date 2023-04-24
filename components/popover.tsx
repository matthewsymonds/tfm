import React from 'react';
import * as RadixPopover from '@radix-ui/react-popover';

type PopoverProps = React.PropsWithChildren<{
    content: React.ReactNode;
    side?: 'top' | 'right' | 'bottom' | 'left';
    sideOffset?: number;
    align?: 'start' | 'center' | 'end';
    alignOffset?: number;
}>;

export const Popover = (props: PopoverProps) => (
    <RadixPopover.Root>
        <RadixPopover.Trigger asChild>{props.children}</RadixPopover.Trigger>
        <RadixPopover.Portal>
            <RadixPopover.Content
                side={props.side}
                align={props.align}
                sideOffset={props.sideOffset}
                alignOffset={props.alignOffset}
            >
                {props.content}
            </RadixPopover.Content>
        </RadixPopover.Portal>
    </RadixPopover.Root>
);

export const MaybePopover = (
    props: PopoverProps & {shouldShowPopover: boolean}
) => {
    if (props.shouldShowPopover) {
        return <Popover {...props}>{props.children}</Popover>;
    }

    return <React.Fragment>{props.children}</React.Fragment>;
};
