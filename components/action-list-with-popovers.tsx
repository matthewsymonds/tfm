import {colors} from 'components/ui';
import {useEffect, useState} from 'react';
import styled from 'styled-components';

const OuterWrapper = styled.div`
    display: flex;
    align-items: center;
    position: relative;
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
        setSelectedAction: (action: T) => void;
        isSelected: boolean;
    }>;
    ActionPopoverComponent: React.FunctionComponent<{
        action: T;
        closePopover: () => void;
    }>;
}) {
    const [selectedAction, _setSelectedAction] = useState<null | T>(null);
    const [isFadingTooltip, setIsFadingTooltip] = useState(false);
    const setSelectedAction = (action: null | T) => {
        if (action === null && selectedAction) {
            setIsFadingTooltip(true);
            setTimeout(() => {
                _setSelectedAction(null);
                setIsFadingTooltip(false);
            }, 250);
        } else {
            _setSelectedAction(action);
        }
    };

    useEffect(() => {
        function clickToCloseListener(this: Window, e: MouseEvent) {
            if (!(e.target as HTMLElement)?.closest(`#${id}`)) {
                setSelectedAction(null);
            }
        }

        if (selectedAction) {
            window.addEventListener('click', clickToCloseListener);
        } else {
            window.removeEventListener('click', clickToCloseListener);
        }

        return () => {
            window.removeEventListener('click', clickToCloseListener);
        };
    }, [selectedAction]);

    return (
        <OuterWrapper id={id}>
            {actions.map(action => {
                return (
                    <StylizedActionWrapper isSelected={selectedAction === action}>
                        <ActionComponent
                            action={action}
                            setSelectedAction={setSelectedAction}
                            isSelected={selectedAction === action}
                        />
                    </StylizedActionWrapper>
                );
            })}
            {selectedAction && (
                <ActionPopoverComponent
                    action={selectedAction}
                    closePopover={() => setSelectedAction(null)}
                />
            )}
        </OuterWrapper>
    );
}

const StylizedActionWrapper = styled.div<{isSelected: boolean}>`
    display: flex;
    position: relative;
    /* height: 32px;
    width: 32px; */
    margin: 0 6px;
    align-items: center;
    justify-content: center;
    cursor: default;
    user-select: none;

    &:before {
        content: '';
        background-color: ${props => (props.isSelected ? colors.LIGHT_BG : 'initial')};
        box-shadow: ${props => (props.isSelected ? 'rgb(0 0 0 / 1) 4px 6px 6px -1px' : 'none')};
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
