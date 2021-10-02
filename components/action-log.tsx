import {Box} from 'components/box';
import {PlayerCorpAndIcon} from 'components/icons/player';
import TexturedCard from 'components/textured-card';
import {colors} from 'components/ui';
import {GameStage} from 'constants/game';
import {GlobalPopoverContext} from 'context/global-popover-context';
import React, {useContext, useEffect, useLayoutEffect, useRef} from 'react';
import ScrollableFeed from 'react-scrollable-feed';
import {PlayerState, useTypedSelector} from 'reducer';
import styled from 'styled-components';
import {BlankButton} from './blank-button';

export const ActionLog = () => {
    const {popoverConfig, setPopoverConfig} = useContext(GlobalPopoverContext);
    const ref = useRef<HTMLButtonElement>(null);

    const isOpen = popoverConfig?.triggerRef === ref;

    return (
        <React.Fragment>
            <BlankButton
                ref={ref}
                onClick={() => {
                    if (!isOpen) {
                        setPopoverConfig({
                            popover: (
                                <TexturedCard
                                    borderRadius={5}
                                    bgColor="white"
                                    style={{
                                        overflow: 'hidden',
                                        boxShadow: '2px 2px 5px 0px hsl(0, 0%, 20%)',
                                    }}
                                >
                                    <LogPanel />
                                </TexturedCard>
                            ),
                            triggerRef: ref,
                            popoverOpts: {
                                onDisappear() {
                                    return false;
                                },
                            },
                        });
                    }
                }}
                style={{marginRight: 4}}
            >
                📜
            </BlankButton>
        </React.Fragment>
    );
};

export const SwitchColors = styled.div`
    > * > * {
        &:nth-child(even) {
            background-color: hsla(0, 0%, 50%, 25%);
        }
    }
`;

export const LogPanelBase = styled(SwitchColors)`
    display: flex;
    max-height: 600px;
    max-width: 500px;
    overflow-y: auto;
    color: ${colors.TEXT_DARK_1};
    flex-direction: column;
`;

export const useIsomorphicLayoutEffect =
    typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const LogPanel = () => {
    const log = useTypedSelector(state => state.log);
    const isCorporationSelection = useTypedSelector(
        state => state.common.gameStage === GameStage.CORPORATION_SELECTION
    );

    const players = useTypedSelector(state => state.players);
    const corporationNames = players
        .filter(player => player?.corporation?.name)
        .map(player => player.corporation.name);

    if (isCorporationSelection) {
        return null;
    }
    return (
        <LogPanelBase>
            <ScrollableFeed>
                {log.map((entry, entryIndex) => (
                    <LogEntry
                        entry={entry}
                        entryIndex={entryIndex}
                        players={players}
                        corporationNames={corporationNames}
                        key={`${entry}-${entryIndex}`}
                    />
                ))}
            </ScrollableFeed>
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
        <Box key={`Log-entry-${entryIndex}`} padding="8px">
            <Box display="inline">
                {elements.map((el, index) => {
                    if (typeof el === 'string') {
                        return <span key={index}>{el}</span>;
                    }
                    return el;
                })}
            </Box>
        </Box>
    );
};

export const LogEntry = React.memo(LogEntryInner, logPropsAreEqual);

function logPropsAreEqual() {
    return true;
}
