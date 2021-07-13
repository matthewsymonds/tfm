import {GameStage} from 'constants/game';
import {AppContext} from 'context/app-context';
import React, {useContext, useEffect} from 'react';
import {toast, ToastContainer} from 'react-toastify';
import {useTypedSelector} from 'reducer';
import {LogEntry} from './action-log';

export const LogToast = () => {
    const log = useTypedSelector(state => state.log);
    const isCorporationSelection = useTypedSelector(
        state => state.common.gameStage === GameStage.CORPORATION_SELECTION
    );

    const context = useContext(AppContext);
    const lastSeenLogItem = context.getLastSeenLogItem();

    const players = useTypedSelector(state => state.players);
    const corporationNames = players
        .filter(player => player?.corporation?.name)
        .map(player => player.corporation.name);

    useEffect(() => {
        if (lastSeenLogItem === log.length) {
            return;
        }

        if (!lastSeenLogItem) {
            return;
        }

        toast(
            <>
                {log
                    .slice(lastSeenLogItem - log.length)
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
        context.setLastSeenLogItem(log.length);
    }, [log.length, lastSeenLogItem]);

    if (isCorporationSelection) {
        return null;
    }

    return <ToastContainer />;
};
