import styled from 'styled-components';

export const SharedActionsContainer = styled.div`
    display: flex;
    color: #333;
    flex: none;
    flex-wrap: wrap;
    align-items: flex-start;
    width: 100%;
    max-width: 640px;
`;

export const SharedActionRow = styled.button<{disabled: boolean}>`
    margin: 8px;
    padding: 8px;
    border: 1px solid ${props => (props.disabled ? '#bbb' : '#ccc')};
    border-radius: 3px;
    cursor: ${props => (props.disabled ? 'pointer' : 'default')};
    color: ${props => (props.disabled ? 'black' : '#5e5e5e')};
    &:hover {
        background: ${props => (props.disabled ? '#f4f4f4' : 'auto')};
        box-shadow: ${props => (props.disabled ? '2px 2px 10px 0px #ddd' : 'none')};
    }
    padding: 16px;
    margin: 8px;
    width: 160px;
    display: flex;
    justify-content: space-between;
`;
