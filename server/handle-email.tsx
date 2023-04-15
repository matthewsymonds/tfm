import {usersModel} from 'database';
import Mailgun from 'mailgun.js';
import formData from 'form-data';
import {getYourTurnGameNames, NamedGame} from 'pages/api/your-turn';

const FIVE_MINUTES = 60 * 1000 * 5;

const DOMAIN = process.env.DOMAIN_NAME;
if (!DOMAIN) {
    throw new Error('DOMAIN is undefined');
}
const API_KEY = process.env.MAILGUN_PRIVATE_API_KEY;
if (!API_KEY) {
    throw new Error('API_KEY is undefined');
}

const mailgun = new Mailgun(formData);
const mg = mailgun.client({username: 'MattSymonds', key: API_KEY});

const getLink = (name: string) =>
    `<a href=https://${DOMAIN}/games/${name}>${name}</a>`;

const getTitle = () => `It is your turn in TFM`;

const getTime = () => {
    const date = new Date();
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const month = date.toLocaleString('default', {
        month: 'long',
        day: 'numeric',
    });

    return `${month} ${hours}:${minutes} `;
};

const getNumGamesMessage = (yourTurnGames: NamedGame[]) =>
    `[TFM] Your turn in ${yourTurnGames.length} game${
        yourTurnGames.length === 1 ? '' : 's'
    }`;

const getMessage = (yourTurnGames: NamedGame[]) =>
    `<div>${getTime()}${getNumGamesMessage(yourTurnGames)}: ${yourTurnGames
        .map(({name}) => getLink(name))
        .join(', ')}</div>`;

const playersToCheck = new Set<string>();

export async function handleEmail(players: string[]) {
    for (const username of players) {
        playersToCheck.add(username);
    }
}

setInterval(sendEmailsIfNeeded, FIVE_MINUTES);

function sendEmailsIfNeeded() {
    for (const username of playersToCheck) {
        sendEmailIfNeeded(username);
    }
}

const sendEmailIfNeeded = async (username: string) => {
    try {
        const yourTurnGames = await getYourTurnGameNames(username);
        if (yourTurnGames.length === 0) {
            playersToCheck.delete(username);
            return;
        }

        const message = getMessage(yourTurnGames);

        const user = await usersModel.findOne({username}, 'email').lean();
        const email = user['email'];

        const data = {
            from: 'TFM admin <noreply@tfm-online.net>',
            to: email,
            subject: getTitle(),
            html: message,
        };
        mg.messages.create(DOMAIN, data).then(() => {
            playersToCheck.delete(username);
        });
    } catch (error) {
        playersToCheck.delete(username);
    }
};
