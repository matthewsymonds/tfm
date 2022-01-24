import {errorLogsModel, retrieveSession, Session} from 'database';
import {NextApiRequest, NextApiResponse} from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    let session: Session | undefined;
    switch (req.method?.toUpperCase()) {
        case 'POST':
            session = await retrieveSession(req, res);
            if (!session?.username) {
                handleNoGo(res);
                return;
            }

            const {gameName, error, attemptedAction} = req.body;
            const errorLog = new errorLogsModel({
                username: session.username,
                gameName,
                error: JSON.stringify(error),
                attemptedAction: JSON.stringify(attemptedAction),
            });
            await errorLog.save();
            res.status(200);
            res.json(JSON.stringify(errorLog));
            break;
        default:
            handleNoGo(res);
    }
};

function handleNoGo(res: NextApiResponse) {
    res.status(404);
    res.json({
        error: 'There was  a problem. Please try again.',
    });
}
