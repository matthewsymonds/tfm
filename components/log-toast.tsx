import {GameStage} from 'constants/game';
import {AppContext} from 'context/app-context';
import React, {useContext, useEffect} from 'react';
import {toast, ToastContainer} from 'react-toastify';
import {useTypedSelector} from 'reducer';
import {LogEntry} from './action-log';

export const LogToast = () => {
    const context = useContext(AppContext);
    const lastSeenLogItem = context.getLastSeenLogItem();
    const log = useTypedSelector(state => state.log);
    const gameName = useTypedSelector(state => state.name);
    const logLength = log.length;

    const isCorporationSelection = useTypedSelector(
        state => state.common.gameStage === GameStage.CORPORATION_SELECTION
    );

    const players = useTypedSelector(state => state.players);
    const corporationNames = useTypedSelector(state =>
        state.players
            .filter(player => player?.corporation?.name)
            .map(player => player.corporation.name)
    );

    useEffect(() => {
        if (lastSeenLogItem == null) {
            return;
        }

        if (lastSeenLogItem >= logLength) {
            return;
        }

        const logItems = log
            .slice(lastSeenLogItem - logLength)
            .filter(entry => !entry.startsWith('Generation')); // Hack

        if (logItems.join('').trim().length === 0) {
            return;
        }

        toast(
            <>
                {logItems.map((entry, entryIndex) => (
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
        context.setLastSeenLogItem(logLength);
        return () => {
            toast.clearWaitingQueue();
        };
    }, [logLength, lastSeenLogItem, gameName]);

    if (isCorporationSelection) {
        return null;
    }

    return <ToastContainer />;
};
