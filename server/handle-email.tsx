import {usersModel} from 'database';
import mailgun from 'mailgun-js';
import {getYourTurnGameNames} from 'pages/api/your-turn';

const timeoutsByUsername: {[username: string]: number} = {};

const FIVE_MINUTES = 300000;

const DOMAIN = process.env.DOMAIN_NAME;
const API_KEY = process.env.MAILGUN_PRIVATE_API_KEY;

const mg = mailgun({apiKey: API_KEY, domain: DOMAIN});

const getMessage = (yourTurnGames: Array<{name: string}>) =>
    `<div>It is your turn in ${yourTurnGames.length} game${
        yourTurnGames.length === 1 ? '' : 's'
    }.</div>`;

const getLink = (yourTurnGames: Array<{name: string}>) =>
    `<a href=https://${DOMAIN}/games/${yourTurnGames[0].name}>Click here</a>`;

export async function handleEmail(players: string[]) {
    for (const username of players) {
        if (typeof timeoutsByUsername[username] !== 'undefined') {
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                const yourTurnGames = await getYourTurnGameNames(username);
                if (yourTurnGames.length === 0) return;

                const message = getMessage(yourTurnGames);
                const link = getLink(yourTurnGames);

                const user = await usersModel.findOne({username: username}, 'email').lean();
                const email = user['email'];

                const data = {
                    from: 'TFM admin <noreply@tfm-online.net>',
                    to: email,
                    subject: 'Your turn in TFM',
                    html: `${message}${link}`,
                };
                mg.messages().send(data, function () {
                    delete timeoutsByUsername[username];
                });
            } catch (error) {
                delete timeoutsByUsername[username];
            }
        }, FIVE_MINUTES);
        timeoutsByUsername[username] = timeout;
    }
}
