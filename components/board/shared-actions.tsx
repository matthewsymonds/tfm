import {colors} from 'components/ui';
import styled from 'styled-components';

export const SharedActionsContainer = styled.div`
    display: flex;
    color: ${colors.TEXT_LIGHT_1};
    flex: none;
    flex-wrap: wrap;
    align-items: flex-start;
    width: 100%;
    max-width: 640px;
`;

export const SharedActionRow = styled.button<{isDisabled: boolean}>`
    margin: 8px;
    padding: 8px;
    border: 1px solid ${props => (!props.isDisabled ? '#bbb' : '#ccc')};
    border-radius: 3px;
    cursor: ${props => (!props.isDisabled ? 'pointer' : 'default')};
    color: ${props => (!props.isDisabled ? 'black' : '#5e5e5e')};
    &:hover:not(:disabled) {
        background: ${props => (!props.isDisabled ? '#f4f4f4' : 'auto')};
        box-shadow: ${props => (!props.isDisabled ? '2px 2px 10px 0px #ddd' : 'none')};
    }
    /*
       HACK: The PaymentPopover doesn't respect disabled state, which appears to be a limitation of
       evergreen-ui. Perhaps we need a more robust popover solution.
    */
    & > * {
        pointer-events: none;
    }
    padding: 16px;
    margin: 8px;
    width: 160px;
    display: flex;
    justify-content: space-between;
`;
