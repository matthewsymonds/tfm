import {colors} from 'components/ui';
import {useRef, useState} from 'react';
import {usePopper} from 'react-popper';
import styled from 'styled-components';

const OuterWrapper = styled.div`
    display: flex;
    height: 100%;
    flex-direction: column;
    align-items: stretch;
    margin: 0px;
`;

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
    }>;
    style?: React.CSSProperties;
    emphasizeOnHover: (t: T) => boolean;
    isVertical: boolean;
}) {
    const [selectedAction, setSelectedAction] = useState<T | null>(null);
    const referenceElement = useRef<HTMLDivElement>(null);
    const popperElement = useRef<HTMLDivElement>(null);
    const {styles, attributes, forceUpdate} = usePopper(
        referenceElement.current,
        popperElement.current,
        {
            placement: isVertical ? 'left-start' : 'top',
            modifiers: [
                {
                    name: 'offset',
                    options: {
                        offset: [0, 10],
                    },
                },
            ],
        }
    );

    function _setSelectedAction(actionOrNull: T | null) {
        setSelectedAction(actionOrNull);
        setTimeout(() => {
            forceUpdate?.();
        }, 0);
    }

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
                        emphasizeOnHover={emphasizeOnHover(action)}
                        setSelectedAction={_setSelectedAction}
                        isVertical={isVertical}
                        ActionComponent={ActionComponent}
                    />
                );
            })}
            {
                <div
                    ref={popperElement}
                    {...attributes.popper}
                    style={{
                        ...styles.popper,
                        zIndex: selectedAction ? 10 : -999,
                        visibility: selectedAction ? 'initial' : 'hidden',
                    }}
                >
                    {selectedAction ? <ActionPopoverComponent action={selectedAction} /> : null}
                </div>
            }
        </OuterWrapper>
    );
}

function ActionButton<T>({
    action,
    ActionComponent,
    setSelectedAction,
    emphasizeOnHover,
    isVertical,
}: {
    action: T;
    ActionComponent: React.FunctionComponent<{
        action: T;
    }>;
    setSelectedAction: (action: T) => void;
    emphasizeOnHover: boolean;
    isVertical: boolean;
}) {
    return (
        <StylizedActionWrapper
            emphasizeOnHover={emphasizeOnHover}
            onMouseEnter={() => setSelectedAction(action)}
            isVertical={isVertical}
        >
            <ActionComponent action={action} />
        </StylizedActionWrapper>
    );
}

const StylizedActionWrapper = styled.div<{emphasizeOnHover: boolean; isVertical: boolean}>`
    display: flex;
    position: relative;
    align-items: center;
    justify-content: flex-end;
    ${props => (props.isVertical ? 'margin-bottom: 4px;' : 'margin-right: 4px;')}
    user-select: none;
    cursor: ${props => (props.emphasizeOnHover ? 'pointer' : 'auto')};
    opacity: ${props => (props.emphasizeOnHover ? 1 : 0.5)};

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
        box-shadow: ${props =>
            props.emphasizeOnHover ? 'rgb(0 0 0 / 1) 4px 6px 6px -1px' : 'none'};
    }
`;
