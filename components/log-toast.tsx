import {GameStage} from 'constants/game';
import {AppContext} from 'context/app-context';
import {useContext, useEffect} from 'react';
import {ToastContainer, toast} from 'react-toastify';
import {useTypedSelector} from 'reducer';
import {LogEntry, bucketLogItems} from './action-log';
import {colors} from './ui';

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
        toast.clearWaitingQueue();
    }, [gameName]);

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
                />,
                {style: {margin: 4}}
            );
        });

        context.setLastSeenLogItem(logLength);
        return () => {
            toast.clearWaitingQueue();
        };
    }, [logLength, lastSeenLogItem]);

    if (isCorporationSelection) {
        return null;
    }

    return (
        <ToastContainer
            newestOnTop={true}
            progressStyle={{
                background: colors.ORANGE,
            }}
            toastClassName="toast"
            style={{padding: 4, zIndex: 20}}
            autoClose={7000}
        />
    );
};
