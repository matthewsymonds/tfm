import {TFMSession} from 'check-session';
import {Session} from 'database';
import jwt from 'jsonwebtoken';
import {NextApiRequest, NextApiResponse} from 'next';

function generateAccessToken(payload: TFMSession): string {
    return jwt.sign(payload, process.env.TOKEN_SECRET, {expiresIn: '365d'});
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    let session: Session | undefined;

    switch (req.method?.toUpperCase()) {
        case 'POST':
        // Todo
        default:
            res.status(400);
            res.json({
                error: 'Unable to interpret request.',
            });
    }
};

function handleNoGo(res: NextApiResponse) {
    res.status(404);
    res.json({
        error: 'Username or password did not match. Please try again.',
    });
}
