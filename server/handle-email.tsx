import {usersModel} from 'database';
import mailgun from 'mailgun-js';
import {getYourTurnGameNames, NamedGame} from 'pages/api/your-turn';

const timeoutsByUsername: Map<string, NodeJS.Timeout> = new Map();

const FIVE_HUNDRED_MINUTES = 300000 * 100;

const DOMAIN = process.env.DOMAIN_NAME;
const API_KEY = process.env.MAILGUN_PRIVATE_API_KEY;

const mg = mailgun({apiKey: API_KEY, domain: DOMAIN});

const getLink = (name: string, count?: number) =>
    `<a href=https://${DOMAIN}/games/${name}>${name}${count ? ` [${count}]` : ''}</a>`;

const getTitle = (yourTurnGames: NamedGame[]) => `It is your turn in TFM`;

const getNumGamesMessage = (yourTurnGames: NamedGame[]) =>
    `[TFM] Your turn in ${yourTurnGames.length} game${yourTurnGames.length === 1 ? '' : 's'}`;

const getMessage = (yourTurnGames: NamedGame[]) =>
    `<div>${getNumGamesMessage(yourTurnGames)}: ${yourTurnGames
        .map(({name, count}) => getLink(name, count))
        .join(', ')}</div>`;

export async function handleEmail(players: string[]) {
    for (const username of players) {
        if (timeoutsByUsername.get(username)) {
            clearTimeout(timeoutsByUsername[username]);
        }

        const timeout = setTimeout(async () => {
            try {
                const yourTurnGames = await getYourTurnGameNames(username);
                if (yourTurnGames.length === 0) return;

                const message = getMessage(yourTurnGames);

                const user = await usersModel.findOne({username: username}, 'email').lean();
                const email = user['email'];

                const data = {
                    from: 'TFM admin <noreply@tfm-online.net>',
                    to: email,
                    subject: getTitle(yourTurnGames),
                    html: message,
                };
                mg.messages().send(data, function () {
                    timeoutsByUsername.delete(username);
                });
            } catch (error) {
                timeoutsByUsername.delete(username);
            }
        }, FIVE_HUNDRED_MINUTES);
        timeoutsByUsername.set(username, timeout);
    }
}
