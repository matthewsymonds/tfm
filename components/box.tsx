import styled from 'styled-components';
import {colors} from 'components/ui';

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

export const Panel = styled.div`
    margin-bottom: 16px;
    padding: 8px;
    background: ${colors.DARK_2};
    border-radius: 3px;
`;
