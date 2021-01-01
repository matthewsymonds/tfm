import {colors} from 'components/ui';
import {useRef, useState} from 'react';
import {usePopper} from 'react-popper';
import styled from 'styled-components';

const OuterWrapper = styled.div`
    display: flex;
    height: 100%;
    flex-direction: column;
    align-items: stretch;
    margin: 0 2px;
`;

export default function ActionListWithPopovers<T>({
    actions,
    ActionComponent,
    ActionPopoverComponent,
    style,
}: {
    actions: Array<T>;
    ActionComponent: React.FunctionComponent<{
        action: T;
    }>;
    ActionPopoverComponent: React.FunctionComponent<{
        action: T;
    }>;
    style?: React.CSSProperties;
}) {
    const [selectedAction, setSelectedAction] = useState<T | null>(null);
    const referenceElement = useRef<HTMLDivElement>();
    const popperElement = useRef<HTMLDivElement>();
    const {styles, attributes} = usePopper(referenceElement.current, popperElement.current, {
        placement: 'right-start',
        modifiers: [
            {
                name: 'offset',
                options: {
                    offset: [0, 10],
                },
            },
        ],
    });

    return (
        <OuterWrapper
            ref={referenceElement}
            style={style}
            onMouseLeave={() => setSelectedAction(null)}
        >
            {actions.map((action, index) => {
                return (
                    <ActionButton<T>
                        key={index}
                        action={action}
                        setSelectedAction={setSelectedAction}
                        ActionComponent={ActionComponent}
                    />
                );
            })}
            {selectedAction && (
                <div
                    ref={popperElement}
                    style={{
                        ...styles.popper,
                        zIndex: 10,
                        display: selectedAction ? 'initial' : 'none',
                    }}
                    {...attributes.popper}
                >
                    <ActionPopoverComponent action={selectedAction} />
                </div>
            )}
            ,
        </OuterWrapper>
    );
}

function ActionButton<T>({
    action,
    ActionComponent,
    setSelectedAction,
}: {
    action: T;
    ActionComponent: React.FunctionComponent<{
        action: T;
    }>;
    setSelectedAction: (action: T) => void;
}) {
    return (
        <StylizedActionWrapper onMouseEnter={() => setSelectedAction(action)}>
            <ActionComponent action={action} />
        </StylizedActionWrapper>
    );
}

const StylizedActionWrapper = styled.div`
    display: flex;
    position: relative;
    align-items: center;
    justify-content: flex-end;
    cursor: default;
    margin-bottom: 4px;
    user-select: none;
    cursor: pointer;

    &:before {
        content: '';
        transition: background-color 250ms, box-shadow 250ms;
        position: absolute;
        height: 100%;
        width: 100%;
        z-index: -1;
        border-radius: 3px;
    }

    &:hover:before {
        background-color: ${colors.LIGHT_BG};
        box-shadow: rgb(0 0 0 / 1) 4px 6px 6px -1px;
    }
`;
