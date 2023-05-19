import {gamesModel, retrieveSession} from 'database';
import {NextApiRequest, NextApiResponse} from 'next';
import {censorGameState} from 'state-serialization';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    let game;

    const {
        query: {id},
    } = req;

    try {
        game = await gamesModel.findOne({name: id});
        if (!game) throw new Error('Not found');
    } catch (error) {
        res.status(404);
        res.json({error: error.message});
        return;
    }

    let username: string;

    if (game.state.players.length === 1) {
        username = game.state.players[0].username;
    } else {
        const sessionResult = await retrieveSession(req, res);
        if (!sessionResult) return;
        username = sessionResult.username;
    }

    switch (req.method?.toUpperCase()) {
        case 'GET':
            res.setHeader(
                'Cache-Control',
                'no-cache, no-store, max-age=0, must-revalidate'
            );
            const index = game.players.indexOf(username);
            const {lastSeenLogItem = []} = game;
            const previousLastSeenLogItem = [...lastSeenLogItem];
            game.lastSeenLogItem ||= [];
            const {lastSeenTimestamp = []} = game;
            const previousLastSeenTimestamp = [...lastSeenTimestamp];
            game.lastSeenTimestamp ||= [];
            if (
                index >= 0 &&
                game.lastSeenTimestamp[index] !== game.state.timestamp
            ) {
                game.lastSeenLogItem[index] = game.state.log.length;
                game.lastSeenTimestamp[index] = game.state.timestamp;
                game.markModified('lastSeenLogItem');
                game.markModified('lastSeenTimestamp');
                try {
                    await game.save();
                } catch (error) {}
            }
            let loggedInPlayerIndex = game.state.players.findIndex(
                player => player.username === username
            );
            if (loggedInPlayerIndex < 0 && game.state.players.length !== 1) {
                res.status(403);
                res.json({error: 'Cannot access this game'});
                return;
            }
            game.state.name = game.name;
            res.json({
                state: censorGameState(game.state, username),
                lastSeenLogItem:
                    previousLastSeenLogItem[index] ??
                    game.lastSeenLogItem[index],
                lastSeenTimestamp:
                    previousLastSeenTimestamp[index] ??
                    game.lastSeenTimestamp[index],
                username,
            });
            return;
        default:
            res.status(400);
            res.json({error: 'Misformatted request!!'});
    }
};
