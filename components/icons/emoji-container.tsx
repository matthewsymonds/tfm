import styled from 'styled-components';

export const EmojiContainer = styled.div<{emoji: string; size: number}>`
    display: inline;
    &::after {
        content: '${props => props.emoji}';
        display: block;
        font-size: ${props => props.size}px;
        line-height: ${props => props.size}px;
    }
`;
