import styled from 'styled-components';

const Button = styled.button<{margin?: string}>`
    padding: 4px;
    margin: ${props => props.margin ?? 'initial'};
    background-color: hsl(0, 0%, 82%, 90%);
    border-radius: 3px;
`;

export default Button;
