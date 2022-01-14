import {usersModel} from 'database';
import {NextApiRequest, NextApiResponse} from 'next';
import {getUsernameRegExp} from './sessions';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    let user;
    const {email, username, password} = req.body;
    switch (req.method?.toUpperCase()) {
        case 'POST':
            // Create a new user.
            const usernameRegex = getUsernameRegExp(username);
            const emailRegex = new RegExp(['^', email, '$'].join(''), 'i');
            user = await usersModel.findOne({
                $or: [{email: emailRegex}, {username: usernameRegex}],
            });

            if (user) {
                res.status(409);
                res.json({
                    error: 'Username or email already taken',
                });
                return;
            }

            user = new usersModel({
                email,
                username,
                password,
            });
            // see usersSchema for hash/salt logic
            await user.save();
            res.status(200);
            res.json({
                email,
                username,
            });
            return;
        default:
            res.status(400);
            res.json({
                error: 'Unable to interpret request.',
            });
    }
};
