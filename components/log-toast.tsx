import {GameStage} from 'constants/game';
import {AppContext} from 'context/app-context';
import React, {useContext, useEffect} from 'react';
import {toast, ToastContainer} from 'react-toastify';
import {useTypedSelector} from 'reducer';
import {bucketLogItems, LogEntry} from './action-log';
import {colors} from './ui';

export const LogToast = () => {
    const context = useContext(AppContext);
    const lastSeenLogItem = context.getLastSeenLogItem();
    const log = useTypedSelector(state => state.log);
    const gameName = useTypedSelector(state => state.name);
    const logLength = log.length;
    const loggedInPlayerIndex = useTypedSelector(state =>
        state.players.findIndex(player => player.username === context.getUsername())
    );

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

        const logItemsToShow = log.slice(lastSeenLogItem - logLength);
        const bucketedEntries = bucketLogItems(logItemsToShow);

        if (bucketedEntries.length === 0) {
            return;
        }

        bucketedEntries.forEach((bucket, index) => {
            toast(
                <LogEntry
                    items={bucket}
                    entryIndex={index}
                    players={players}
                    corporationNames={corporationNames}
                    shouldUsePadding={false}
                />
            );
        });

        context.setLastSeenLogItem(logLength);
        return () => {
            toast.clearWaitingQueue();
        };
    }, [logLength, lastSeenLogItem, gameName]);

    if (isCorporationSelection) {
        return null;
    }

    return (
        <ToastContainer
            newestOnTop={true}
            progressStyle={{
                background: colors.DARK_ORANGE,
            }}
            toastClassName="toast"
            style={{padding: 4, zIndex: 20}}
        />
    );
};
