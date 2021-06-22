import {GameStage} from 'constants/game';
import {usePrevious} from 'hooks/use-previous';
import React, {useEffect, useRef} from 'react';
import {toast, ToastContainer} from 'react-toastify';
import {useTypedSelector} from 'reducer';
import {LogEntry} from './action-log';

export const LogToast = () => {
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

    useEffect(() => {
        if (lastNumLogItems === log.length) {
            return;
        }

        if (!lastNumLogItems) {
            return;
        }

        toast(
            <>
                {log
                    .slice(lastNumLogItems - log.length)
                    .filter(entry => !entry.startsWith('Generation')) // Hack
                    .map((entry, entryIndex) => (
                        <div key={`${entry}-${entryIndex}`}>
                            <LogEntry
                                entry={entry}
                                entryIndex={entryIndex}
                                players={players}
                                corporationNames={corporationNames}
                            />
                        </div>
                    ))}
            </>
        );
    }, [lastNumLogItems === log.length]);

    if (isCorporationSelection) {
        return null;
    }

    return <ToastContainer />;
};
