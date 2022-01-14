import {usersModel} from 'database';
import mailgun from 'mailgun-js';
import {getYourTurnGameNames, NamedGame} from 'pages/api/your-turn';

const timeoutsByUsername: Map<string, NodeJS.Timeout> = new Map();

const FIVE_MINUTES = 300000;

const DOMAIN = process.env.DOMAIN_NAME;
const API_KEY = process.env.MAILGUN_PRIVATE_API_KEY;

const mg = mailgun({apiKey: API_KEY, domain: DOMAIN});

const getLink = (name: string, count?: number) =>
    `<a href=https://${DOMAIN}/games/${name}>${name}${count ? ` [${count}]` : ''}</a>`;

const getNumGamesMessage = (yourTurnGames: NamedGame[]) =>
    `It is your turn in ${yourTurnGames.length} game${yourTurnGames.length === 1 ? '' : 's'}`;

const getTitle = (yourTurnGames: NamedGame[], notYouPlayers: string[]) =>
    `[TFM] Your turn in ${yourTurnGames.length} game${
        yourTurnGames.length === 1 ? '' : 's'
    } with ${notYouPlayers.join(', ')}`;

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
                    subject: getTitle(
                        yourTurnGames,
                        players.filter(player => player !== username)
                    ),
                    html: message,
                };
                mg.messages().send(data, function () {
                    delete timeoutsByUsername[username];
                });
            } catch (error) {
                delete timeoutsByUsername[username];
            }
        }, FIVE_MINUTES);
        timeoutsByUsername.set(username, timeout);
    }
}
