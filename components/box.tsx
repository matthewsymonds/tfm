import styled from 'styled-components';

export function Box(props) {
    const {children, ...rest} = props;

    return <div style={rest}>{children}</div>;
}

export function Flex(props) {
    const flexProps = {
        display: 'flex',
        ...props,
    };

    return <Box {...flexProps} />;
}

export const TypicalBox = styled.div`
    font-family: sans-serif;
    width: 100%;
    margin-bottom: 16px;
    border: 1px solid #dedede;
    background: #fdfdfd;
    border-radius: 8px;
`;
