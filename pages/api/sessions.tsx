import {sessionsModel, usersModel, retrieveSession, appendSecurityCookieModifiers} from 'database';
import absoluteUrl from 'next-absolute-url';

export default async (req, res) => {
    let session: typeof sessionsModel;

    switch (req.method) {
        case 'POST':
            // Log in!
            const {username, password} = req.body;
            const user = await usersModel.findOne({
                username,
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

            session = new sessionsModel({
                username,
            });

            await session.save();

            const theCookie = appendSecurityCookieModifiers(
                req.secure,
                absoluteUrl(req).host,
                `session=${session.token}`
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
                session.remove();
            }
            return res.end();
        default:
            res.status(400);
            res.json({
                error: 'Unable to interpret request.',
            });
    }
};
