import {ApiClient} from 'api-client';
import {ActionGuard} from 'client-server-shared/action-guard';
import {CONVERSIONS} from 'constants/conversion';
import {Resource} from 'constants/resource';
import {AppContext} from 'context/app-context';
import {useSyncState} from 'hooks/sync-state';
import {useContext, useEffect} from 'react';
import {useDispatch, useStore} from 'react-redux';
import {GameState, useTypedSelector} from 'reducer';
import {getHumanReadableTileName} from 'selectors/get-human-readable-tile-name';
import {getWaitingMessage} from 'selectors/get-waiting-message';
import {ActionBar, ActionBarRow} from './action-bar';
import {Board} from './board/board';
import {PlayerResourceBoard} from './resource';
import {TurnContext} from './turn-context';

export const GreeneryPlacement = ({playerIndex}: {playerIndex: number}) => {
    const player = useTypedSelector(state => state.players[playerIndex]);
    const corporation = useTypedSelector(state => state.players[playerIndex].corporation);
    const dispatch = useDispatch();
    const store = useStore<GameState>();
    const state = store.getState();
    const waitingMessage = getWaitingMessage(playerIndex);

    const context = useContext(AppContext);
    const loggedInPlayer = context.getLoggedInPlayer(state);

    const conversion = CONVERSIONS[Resource.PLANT];
    const actionGuard = new ActionGuard(state, loggedInPlayer.username);

    const [canDoConversion] = actionGuard.canDoConversion(conversion);

    useSyncState();

    useEffect(() => {
        context.processQueue(dispatch);
    }, []);

    const apiClient = new ApiClient(dispatch);

    return (
        <>
            <ActionBar>
                <ActionBarRow>
                    <h1>
                        {corporation && corporation.name} ({player.username})
                    </h1>
                    <TurnContext>
                        <div>TFR {player.terraformRating}</div>
                    </TurnContext>
                    <TurnContext>
                        <button
                            disabled={context.shouldDisableUI(state)}
                            onClick={() => apiClient.skipActionAsync()}
                        >
                            Done placing greeneries
                        </button>
                    </TurnContext>
                    <PlayerResourceBoard
                        plantConversionOnly
                        player={player}
                        isLoggedInPlayer={true}
                    />
                </ActionBarRow>
                {waitingMessage ? <ActionBarRow>{waitingMessage}</ActionBarRow> : null}
            </ActionBar>
            <Board />

            {
                <ActionBar className="bottom">
                    <ActionBarRow>
                        {player.pendingTilePlacement ? (
                            <h3>
                                Place a {getHumanReadableTileName(player.pendingTilePlacement.type)}{' '}
                                tile.
                            </h3>
                        ) : (
                            <h3>
                                {canDoConversion
                                    ? 'You may convert plants into a greenery.'
                                    : 'Cannot place any more greeneries.'}
                            </h3>
                        )}
                    </ActionBarRow>
                </ActionBar>
            }
        </>
    );
};
