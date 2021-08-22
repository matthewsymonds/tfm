import {appendSecurityCookieModifiers, retrieveSession, Session, usersModel} from 'database';
import jwt from 'jsonwebtoken';
import absoluteUrl from 'next-absolute-url';

function generateAccessToken(payload: {username: string}): string {
    return jwt.sign(payload, process.env.TOKEN_SECRET, {expiresIn: '365d'});
}

export default async (req, res) => {
    let session: Session | undefined;

    switch (req.method) {
        case 'POST':
            // Log in!
            const {username, password} = req.body;
            const usernameRegex = new RegExp(['^', username, '$'].join(''), 'i');
            const user = await usersModel.findOne({
                username: usernameRegex,
            });
            let isMatch: boolean;
            try {
                isMatch = await user.comparePassword(password);
            } catch (error) {
                res.status(500);
                res.json({
                    error: 'Hmm. Something went wrong.',
                });
                return;
            }

            if (!isMatch) {
                res.status(404);
                res.json({
                    error: 'Username or password did not match. Please try again.',
                });
                return;
            }

            const theCookie = appendSecurityCookieModifiers(
                req.secure,
                absoluteUrl(req).host,
                `session=${generateAccessToken({username: String(user.username)})}`
            );

            res.writeHead(200, {
                'Set-Cookie': theCookie,
                'Content-Type': 'application/json',
            });

            return res.end(
                JSON.stringify({
                    username,
                })
            );
        case 'GET':
            session = await retrieveSession(req, res);
            if (!session) {
                return res.end();
            }

            return res.json({username: session.username});
        case 'DELETE':
            // Log out
            session = await retrieveSession(req, res);
            if (session) {
                res.writeHead(200, {
                    'Set-Cookie': 'session=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT',
                    'Content-Type': 'application/json',
                });
            }
            return res.end();
        default:
            res.status(400);
            res.json({
                error: 'Unable to interpret request.',
            });
    }
};
