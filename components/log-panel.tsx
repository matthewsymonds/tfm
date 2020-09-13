import {Box, Flex, PanelWithTabs} from 'components/box';
import {colors} from 'components/ui';
import {useTypedSelector} from 'reducer';
import styled from 'styled-components';

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
        <PanelWithTabs
            selectedTabIndex={0}
            tabs={['Action log']}
            tabType="log"
            setSelectedTabIndex={(_: number) => {}}
        >
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
        </PanelWithTabs>
    );
};
