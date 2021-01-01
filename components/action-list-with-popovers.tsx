import {colors} from 'components/ui';
import {useEffect, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import {usePopper} from 'react-popper';
import styled from 'styled-components';

const OuterWrapper = styled.div`
    display: flex;
    height: 100%;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    margin: 0 2px;
`;

export default function ActionListWithPopovers<T>({
    id,
    actions,
    ActionComponent,
    ActionPopoverComponent,
}: {
    id: string;
    actions: Array<T>;
    ActionComponent: React.FunctionComponent<{
        action: T;
    }>;
    ActionPopoverComponent: React.FunctionComponent<{
        action: T;
    }>;
}) {
    return (
        <OuterWrapper id={id}>
            {actions.map((action, index) => {
                return (
                    <ActionButton<T>
                        action={action}
                        key={index}
                        ActionComponent={ActionComponent}
                        ActionPopoverComponent={ActionPopoverComponent}
                        targetId={id}
                    />
                );
            })}
        </OuterWrapper>
    );
}

function ActionButton<T>({
    action,
    ActionComponent,
    ActionPopoverComponent,
    targetId,
}: {
    targetId: string;
    action: T;
    ActionComponent: React.FunctionComponent<{
        action: T;
    }>;
    ActionPopoverComponent: React.FunctionComponent<{
        action: T;
    }>;
}) {
    const [_document, setDocument] = useState<null | Document>(null);
    const [isPopperVisible, setIsPopperVisible] = useState(false);
    const referenceElement = useRef(null);
    const popperElement = useRef(null);
    const {styles, attributes} = usePopper(referenceElement.current, popperElement.current, {
        placement: 'left-start',
        modifiers: [
            {
                name: 'offset',
                options: {
                    offset: [0, 10],
                },
            },
        ],
    });

    useEffect(() => {
        if (!_document) {
            setDocument(document);
        }
    }, []);

    return (
        <StylizedActionWrapper
            ref={referenceElement}
            onMouseEnter={() => setIsPopperVisible(true)}
            onMouseLeave={() => setIsPopperVisible(false)}
        >
            <ActionComponent action={action} />
            {_document &&
                _document.querySelector(`#${targetId}`) &&
                ReactDOM.createPortal(
                    <div
                        ref={popperElement}
                        style={{
                            ...styles.popper,
                            display: isPopperVisible ? 'initial' : 'none',
                        }}
                        {...attributes.popper}
                    >
                        <ActionPopoverComponent action={action} />
                    </div>,
                    _document.querySelector(`#${targetId}`)
                )}
        </StylizedActionWrapper>
    );
}

const StylizedActionWrapper = styled.div`
    display: flex;
    position: relative;
    align-items: center;
    justify-content: center;
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
