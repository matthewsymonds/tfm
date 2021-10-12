import {usersModel} from 'database';
import mailgun from 'mailgun-js';
import {getYourTurnGameNames, NamedGame} from 'pages/api/your-turn';

const timeoutsByUsername: {[username: string]: number} = {};

const FIVE_MINUTES = 300000;

const DOMAIN = process.env.DOMAIN_NAME;
const API_KEY = process.env.MAILGUN_PRIVATE_API_KEY;

const mg = mailgun({apiKey: API_KEY, domain: DOMAIN});

const getLink = (name: string) => `<a href=https://${DOMAIN}/games/${name}>${name}</a>`;

const getNumGamesMessage = (yourTurnGames: NamedGame[]) =>
    `It is your turn in ${yourTurnGames.length} game${yourTurnGames.length === 1 ? '' : 's'}`;

const getTitle = (yourTurnGames: NamedGame[], notYouPlayers: string[]) =>
    `[TFM] [${yourTurnGames[0].length}] Your turn in ${
        yourTurnGames[0].name
    } with ${notYouPlayers.join(', ')}`;

const getMessage = (yourTurnGames: NamedGame[]) =>
    `<div>${getNumGamesMessage(yourTurnGames)}: ${yourTurnGames
        .map(({name}) => getLink(name))
        .join(', ')}</div>`;

export async function handleEmail(players: string[]) {
    for (const username of players) {
        if (typeof timeoutsByUsername[username] !== 'undefined') {
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
        timeoutsByUsername[username] = timeout;
    }
}
