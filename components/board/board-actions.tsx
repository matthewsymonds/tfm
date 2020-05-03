import styled from 'styled-components';

export const BoardActionsContainer = styled.div`
    display: flex;
    flex-direction: column;
    background-color: #1f5994;
    font-family: sans-serif;
    border: 1px solid white;
    border-radius: 2px;
    color: white;
    flex: none;
`;

export const BoardActionHeader = styled.div`
    padding: 16px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 13px;
    font-weight: 600;
`;

export const BoardActionRow = styled.div<{selectable: boolean}>`
    padding: 8px 16px;
    font-size: 15px;
    cursor: ${props => (props.selectable ? 'pointer' : 'default')};
    color: ${props => (props.selectable ? 'white' : '#9e9e9e')};
    display: flex;
    justify-content: space-between;
    ${props => {
        if (props.selectable) {
            return `
                &:hover {
                    color: #212121;
                    background: rgba(255, 255, 255, 0.5);
                }
            `;
        }
        return '';
    }}
`;
