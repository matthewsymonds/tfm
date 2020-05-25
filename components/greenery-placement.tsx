import {ActionBar, ActionBarRow} from './action-bar';
import {skipAction} from 'actions';
import {
    ResourceBoard,
    ResourceBoardRow,
    ResourceBoardCell,
    PlayerResourceBoard,
    getConversionAmount,
} from './resource';
import {Resource} from 'constants/resource';
import {CONVERSIONS} from 'constants/conversion';
import {Board} from './board/board';
import {useTypedSelector, RootState} from 'reducer';
import {useContext, useEffect} from 'react';
import {AppContext} from 'context/app-context';
import {TurnContext} from './turn-context';
import {useDispatch, useStore} from 'react-redux';
import {ConversionLink} from './conversion-link';
import {getWaitingMessage} from 'selectors/get-waiting-message';
import {getHumanReadableTileName} from 'selectors/get-human-readable-tile-name';
import {useSyncState} from 'pages/sync-state';

export const GreeneryPlacement = ({playerIndex}: {playerIndex: number}) => {
    const player = useTypedSelector(state => state.players[playerIndex]);
    const corporation = useTypedSelector(state => state.players[playerIndex].corporation);
    const resources = useTypedSelector(state => state.players[playerIndex].resources);
    const productions = useTypedSelector(state => state.players[playerIndex].productions);
    const dispatch = useDispatch();
    const store = useStore<RootState>();
    const state = store.getState();
    const waitingMessage = getWaitingMessage(playerIndex, state);

    const context = useContext(AppContext);

    const conversion = CONVERSIONS[Resource.PLANT];

    const conversionQuantity = getConversionAmount(player, conversion);
    const canDoConversion = context.canDoConversion(
        conversion,
        player,
        Resource.PLANT,
        conversionQuantity
    );

    useSyncState();

    useEffect(() => {
        context.processQueue(dispatch);
    }, []);

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
                            onClick={() => dispatch(skipAction(playerIndex))}
                        >
                            Done placing greeneries
                        </button>
                    </TurnContext>
                    <PlayerResourceBoard player={player} isLoggedInPlayer={true} />
                </ActionBarRow>
                {waitingMessage ? <ActionBarRow>{waitingMessage}</ActionBarRow> : null}
            </ActionBar>
            <Board
                board={state.common.board}
                playerIndex={playerIndex}
                parameters={state.common.parameters}
            />

            {
                <ActionBar className="bottom">
                    <ActionBarRow>
                        {player.pendingTilePlacement ? (
                            <h3>
                                Place the{' '}
                                {getHumanReadableTileName(player.pendingTilePlacement.type)} tile.
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
