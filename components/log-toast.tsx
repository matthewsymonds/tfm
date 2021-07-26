import {GameStage} from 'constants/game';
import {usePrevious} from 'hooks/use-previous';
import React, {useEffect, useState} from 'react';
import {toast, ToastContainer} from 'react-toastify';
import {useTypedSelector} from 'reducer';
import {LogEntry} from './action-log';

export const LogToast = ({lastSeenLogItem}: {lastSeenLogItem: number}) => {
    const log = useTypedSelector(state => state.log);
    const gameName = useTypedSelector(state => state.name);
    const previousGameName = usePrevious(gameName);
    const isCorporationSelection = useTypedSelector(
        state => state.common.gameStage === GameStage.CORPORATION_SELECTION
    );

    const [theLastSeenLogItem, setTheLastSeenLogItem] = useState(lastSeenLogItem);

    useEffect(() => {
        setTheLastSeenLogItem(lastSeenLogItem);
    }, [lastSeenLogItem]);

    const players = useTypedSelector(state => state.players);
    const corporationNames = players
        .filter(player => player?.corporation?.name)
        .map(player => player.corporation.name);

    useEffect(() => {
        if (theLastSeenLogItem == null) {
            return;
        }

        if (theLastSeenLogItem >= log.length) {
            return;
        }

        const logItems = log
            .slice(theLastSeenLogItem - log.length)
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
        setTheLastSeenLogItem(log.length);
    }, [log.length, theLastSeenLogItem, gameName, previousGameName]);

    if (isCorporationSelection) {
        return null;
    }

    return <ToastContainer />;
};
