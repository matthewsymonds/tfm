import {Panel, Box, Flex} from 'components/box';
import {useTypedSelector} from 'reducer';
import styled from 'styled-components';
import {colors} from 'components/ui';

const LogHeader = styled.h2`
    display: flex;
    width: 100%;
    margin: 0 0 16px;
    color: #fff;
`;

export const SwitchColors = styled.div`
    > * {
        &:nth-child(odd) {
            background: ${colors.LOG_BG};
        }
        &:nth-child(even) {
            background: ${colors.LOG_BG_ALT};
        }
    }
`;

export const LogPanel = () => {
    const log = useTypedSelector(state => state.log);

    return (
        <Panel>
            <LogHeader>Log</LogHeader>
            <Flex maxHeight="400px" overflowY="auto" flexDirection="column-reverse">
                <SwitchColors>
                    {log.map((entry, entryIndex) => {
                        return (
                            <Box marginBottom="2px" padding="8px" key={'Log-entry-' + entryIndex}>
                                {entry}
                            </Box>
                        );
                    })}
                </SwitchColors>
            </Flex>
        </Panel>
    );
};
