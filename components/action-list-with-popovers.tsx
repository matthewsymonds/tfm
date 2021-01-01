import {colors} from 'components/ui';
import {Tooltip} from 'react-tippy';
import styled from 'styled-components';

const OuterWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    margin: 8px 0;
    /* background: ${colors.ACCORDION_BG}; */
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
                    <StylizedActionWrapper key={index}>
                        <Tooltip useContext html={<ActionPopoverComponent action={action} />}>
                            <ActionComponent action={action} />
                        </Tooltip>
                    </StylizedActionWrapper>
                );
            })}
        </OuterWrapper>
    );
}

const StylizedActionWrapper = styled.div`
    display: flex;
    position: relative;
    margin: 0 6px;
    align-items: center;
    justify-content: center;
    cursor: default;
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
