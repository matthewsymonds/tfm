import {ApiActionType} from 'client-server-shared/api-action-type';
import {playGame} from 'client-server-shared/play-game';
import {GameStage} from 'constants/game';
import {gamesModel, retrieveSession} from 'database';
import {ApiActionHandler} from 'server/api-action-handler';
import {StateHydrator} from 'server/state-hydrator';
import {censorGameState} from 'state-serialization';

// This isn't perfect. But it's an attempted safeguard against spammed requests.
let lock: {[gameName: string]: string[]} = {};

export default async (req, res) => {
    const sessionResult = await retrieveSession(req, res);
    if (!sessionResult) return;
    // only accept POST!
    const method = req.method.toUpperCase();

    if (method !== 'POST') {
        res.status(400);
        res.json({error: 'Misformatted request!!'});
        return;
    }

    const {
        query: {id},
    } = req;

    let game;
    const {username} = sessionResult;

    try {
        if ((lock[id] ?? []).includes(username)) {
            res.json({error: 'Game update in progress.'});
            return;
        }
        game = await gamesModel.findOne({name: id});
        if (!game) throw new Error('Not found');
        if (!game.players.includes(username)) throw new Error('Not in this game!');
        lock[game.name] ||= [];
        lock[game.name].push(username);
        const {
            type,
            payload,
            actionCount,
        }: {type: ApiActionType; payload; actionCount: number | undefined} = req.body;
        if (
            typeof actionCount !== 'undefined' &&
            game.state.actionCount !== actionCount &&
            game.state.common.gameStage === GameStage.ACTIVE_ROUND
        ) {
            res.json({error: 'Client out of sync with server.'});
            purgeLock(lock, username, game.name);
            return;
        }

        const hydratedGame = {
            queue: game.queue,
            state: game.state,
            players: game.players,
            name: game.name,
        };

        const originalState = hydratedGame.state;
        const actionHandler = new ApiActionHandler(hydratedGame, username);
        const stateHydrator = new StateHydrator(hydratedGame, username);
        hydratedGame.state.name = game.name;

        playGame(type, payload, actionHandler, stateHydrator, originalState);

        game.queue = hydratedGame.queue;
        game.state = hydratedGame.state;
        game.currentPlayer = game.state.players[game.state.common.currentPlayerIndex].username;
        if (game.state.common.gameStage === GameStage.END_OF_GAME) {
            game.currentPlayer = '';
        }
        game.updatedAt = Date.now();
        game.lastSeenLogItem ||= [];
        game.lastSeenLogItem[game.players.indexOf(username)] = game.state.log.length;
        game.markModified('lastSeenLogItem');
        await game.save({validateBeforeSave: false});
        purgeLock(lock, username, game.name);

        res.json({
            state: censorGameState(hydratedGame.state, username),
        });
    } catch (error) {
        delete lock[game.name];
        res.status(404);
        res.json({error: error.message});
    }
};

function purgeLock(lock: {[gameName: string]: string[]}, username: string, gameName: string) {
    lock[gameName] = lock[gameName].filter(name => name !== username);
    if (lock[gameName].length === 0) {
        delete lock[gameName];
    }
}
