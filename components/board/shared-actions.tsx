import styled from 'styled-components';

export const SharedActionsContainer = styled.div`
    display: flex;
    font-family: sans-serif;
    color: #333;
    flex: none;
    flex-wrap: wrap;
    align-items: flex-start;
    width: 100%;
    max-width: 640px;
`;

export const SharedActionRow = styled.div<{selectable: boolean}>`
    margin: 8px;
    padding: 8px;
    border: 1px solid ${props => (props.selectable ? '#bbb' : '#ccc')};
    border-radius: 3px;
    cursor: ${props => (props.selectable ? 'pointer' : 'default')};
    color: ${props => (props.selectable ? 'black' : '#5e5e5e')};
    &:hover {
        background: ${props => (props.selectable ? '#f4f4f4' : 'auto')};
        box-shadow: ${props => (props.selectable ? '2px 2px 10px 0px #ddd' : 'none')};
    }
    padding: 16px;
    margin: 8px;
    width: 160px;
    display: flex;
    justify-content: space-between;
`;
