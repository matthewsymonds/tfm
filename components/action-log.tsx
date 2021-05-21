import {Box, Flex} from 'components/box';
import Button from 'components/controls/button';
import {PlayerCorpAndIcon} from 'components/icons/player';
import TexturedCard from 'components/textured-card';
import {colors} from 'components/ui';
import {GameStage} from 'constants/game';
import {usePrevious} from 'hooks/use-previous';
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {usePopper} from 'react-popper';
import {PlayerState, useTypedSelector} from 'reducer';
import styled from 'styled-components';
import {BlankButton} from './blank-button';

export const ActionLog = () => {
    const [isPopperVisible, setIsPopperVisible] = useState(false);
    const referenceElement = useRef(null);
    const popperElement = useRef(null);
    const {styles, attributes} = usePopper(referenceElement.current, popperElement.current, {
        placement: 'bottom-end',
        modifiers: [
            {
                name: 'offset',
                options: {
                    offset: [0, 2],
                },
            },
        ],
    });

    return (
        <React.Fragment>
            <BlankButton
                ref={referenceElement}
                onClick={() => setIsPopperVisible(!isPopperVisible)}
                style={{marginRight: 4}}
            >
                📜
            </BlankButton>
            <TexturedCard
                ref={popperElement}
                borderRadius={5}
                bgColor="white"
                style={{
                    ...styles.popper,
                    height: isPopperVisible ? 'initial' : '0',
                    border: isPopperVisible ? '' : 'none',
                    zIndex: 20,
                    overflow: 'hidden',
                    // borderRadius: 5,
                    boxShadow: '2px 2px 5px 0px hsl(0, 0%, 20%)',
                }}
                {...attributes.popper}
            >
                <LogPanel />
            </TexturedCard>
        </React.Fragment>
    );
};

export const SwitchColors = styled.div`
    > * {
        &:nth-child(even) {
            background-color: hsla(0, 0%, 50%, 25%);
        }
    }
`;

export const LogPanelBase = styled(SwitchColors)`
    display: flex;
    max-height: 400px;
    overflow-y: auto;
    color: ${colors.TEXT_DARK_1};
    flex-direction: column-reverse;
`;

export const useIsomorphicLayoutEffect =
    typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const LogPanel = () => {
    const log = useTypedSelector(state => state.log);
    const isCorporationSelection = useTypedSelector(
        state => state.common.gameStage === GameStage.CORPORATION_SELECTION
    );
    const logRef = useRef<HTMLDivElement>(null);
    const lastNumLogItems = usePrevious(log.length);

    const players = useTypedSelector(state => state.players);
    const corporationNames = players
        .filter(player => player?.corporation?.name)
        .map(player => player.corporation.name);

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

    if (isCorporationSelection) {
        return null;
    }
    return (
        <LogPanelBase ref={logRef}>
            {log.map((entry, entryIndex) => (
                <LogEntry
                    entry={entry}
                    entryIndex={entryIndex}
                    players={players}
                    corporationNames={corporationNames}
                    key={`${entry}-${entryIndex}`}
                />
            ))}
        </LogPanelBase>
    );
};

const LogEntryInner = ({
    entry,
    entryIndex,
    players,
    corporationNames,
}: {
    entry: string;
    entryIndex: number;
    players: PlayerState[];
    corporationNames: string[];
}) => {
    const elements: Array<React.ReactNode> = [entry];

    corporationNames.forEach((corpName, index) => {
        let i = 0;
        let key = 0;
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
                        stringOrElement.substring(0, stringOrElement.indexOf(corpName))
                    );
                    i++;
                    elements.splice(
                        i,
                        0,
                        <PlayerCorpAndIcon
                            key={entryIndex + corpName + key++}
                            player={players[index]}
                            isInline={true}
                        />
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
        <Box padding="8px" key={'Log-entry-' + entryIndex} display="inline">
            {elements.map((el, index) => {
                if (typeof el === 'string') {
                    return <span key={index}>{el}</span>;
                }
                return el;
            })}
        </Box>
    );
};

const LogEntry = React.memo(LogEntryInner, logPropsAreEqual);

function logPropsAreEqual() {
    return true;
}
