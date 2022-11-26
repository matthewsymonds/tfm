import {usersModel} from 'database';
import mailgun from 'mailgun-js';
import {NextApiRequest, NextApiResponse} from 'next';

const DOMAIN = process.env.DOMAIN_NAME;
const API_KEY = process.env.MAILGUN_PRIVATE_API_KEY;

const FIFTEEN_MINUTES_IN_MILLISECONDS = 15 * 60 * 1000;

const mg = mailgun({apiKey: API_KEY, domain: DOMAIN});

function generateToken() {
    return Math.random().toString(36).slice(2);
}

function generateResetPasswordLink(token: string) {
    return `http://${DOMAIN}/forgot-password/?token=${token}`;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method?.toUpperCase()) {
        case 'POST':
            // retrieve user from req.body.
            // check if user exists.
            let {username, email, password, token} = req.body;
            if (token) {
                // find user with username and token.
                // if user exists, update password.
                const user = await usersModel.findOne({
                    resetPasswordToken: token,
                });
                if (!user) {
                    res.status(400).json({
                        error: 'Could not complete request.',
                    });
                    return;
                }
                if (Date.now() > user.resetPasswordExpires) {
                    res.status(400).json({
                        error: 'Token has expired.',
                    });
                    return;
                }
                user.password = password;
                user.resetPasswordToken = undefined;
                user.resetPasswordTokenExpires = undefined;
                await user.save();
                res.status(200).json({
                    message: 'Password updated',
                });
                return;
            }
            const user = await usersModel.findOne({
                username,
                email,
            });
            if (!user) {
                res.status(400).json({
                    error: 'Could not complete request.',
                });
                return;
            }

            token = generateToken();
            user.resetPasswordToken = token;
            user.resetPasswordExpires =
                Date.now() + FIFTEEN_MINUTES_IN_MILLISECONDS;
            await user.save();

            const data = {
                from: 'TFM admin <noreply@tfm-online.net>',
                to: email,
                subject: 'Forgot password',
                html: `<div>Please click the following link to reset your password:
                <a href="${generateResetPasswordLink(
                    token
                )}">Reset password</a>.</div>
                <div>This link will expire in 15 minutes.</div>`,
            };
            try {
                mg.messages().send(data, function () {
                    res.status(200);
                    res.json({
                        message: 'Email sent.',
                    });
                });
            } catch (error) {
                res.status(500);
                res.json({
                    error: 'There was an error. Please try again.',
                });
            }
            return;
        default:
            res.status(400);
            res.json({
                error: 'Unable to interpret request.',
            });
    }
};
