import {Box, Flex, PanelWithTabs} from 'components/box';
import {PlayerCorpAndIcon} from 'components/icons/player';
import {colors} from 'components/ui';
import {GameStage} from 'constants/game';
import {usePrevious} from 'hooks/use-previous';
import {useEffect, useLayoutEffect, useRef} from 'react';
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

export const LogPanelBase = styled(SwitchColors)`
    display: flex;
    max-height: 400px;
    overflow-y: auto;
    flex-direction: column-reverse;
`;

const useIsomorphicLayoutEffect = typeof window !== undefined ? useLayoutEffect : useEffect;

export const LogPanel = () => {
    const log = useTypedSelector(state => state.log);
    const isCorporationSelection = useTypedSelector(
        state => state.common.gameStage === GameStage.CORPORATION_SELECTION
    );
    const logRef = useRef<HTMLDivElement>(null);
    const lastNumLogItems = usePrevious(log.length);
    const players = useTypedSelector(state => state.players);
    const corporationNames = players.map(player => player.corporation.name);

    if (isCorporationSelection) {
        return null;
    }

    useIsomorphicLayoutEffect(() => {
        const logWrapperElement = logRef.current;
        if (logWrapperElement) {
            logWrapperElement.scroll({
                top: -1 * logWrapperElement.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, []);

    useIsomorphicLayoutEffect(() => {
        const logWrapperElement = logRef.current;

        // scroll the log to the top whenever a new log item comes in
        if (logWrapperElement && lastNumLogItems !== log.length) {
            logWrapperElement.scroll({
                top: -1 * logWrapperElement.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [lastNumLogItems, log.length]);

    return (
        <PanelWithTabs
            selectedTabIndex={0}
            tabs={['Action log ⬆️']}
            tabType="log"
            setSelectedTabIndex={(_: number) => {}}
        >
            <LogPanelBase ref={logRef}>
                {log.map((entry, entryIndex) => {
                    const elements: Array<React.ReactNode> = [entry];
                    corporationNames.forEach((corpName, index) => {
                        let i = 0;
                        while (i < elements.length) {
                            const stringOrElement = elements[i];
                            if (typeof stringOrElement !== 'string') {
                                i++;
                                continue;
                            } else {
                                if (stringOrElement.indexOf(corpName) === -1) {
                                    i++;
                                    continue;
                                } else {
                                    elements.splice(
                                        i,
                                        1,
                                        stringOrElement.substring(
                                            0,
                                            stringOrElement.indexOf(corpName)
                                        )
                                    );
                                    i++;
                                    elements.splice(
                                        i,
                                        0,
                                        <Flex margin="0 4px" key={i}>
                                            <PlayerCorpAndIcon
                                                player={players[index]}
                                                color="black"
                                            />
                                        </Flex>
                                    );
                                    i++;
                                    elements.splice(
                                        i,
                                        0,
                                        stringOrElement.substring(
                                            stringOrElement.indexOf(corpName) + corpName.length
                                        )
                                    );
                                    i++;
                                    continue;
                                }
                            }
                        }
                    });

                    return (
                        <Box marginBottom="2px" padding="8px" key={'Log-entry-' + entryIndex}>
                            <Flex alignItems="flex-start">
                                {elements.map((el, index) => {
                                    if (typeof el === 'string') {
                                        return <span key={index}>{el}</span>;
                                    }
                                    return el;
                                })}
                            </Flex>
                        </Box>
                    );
                })}
            </LogPanelBase>
        </PanelWithTabs>
    );
};
