const glob = require('glob');

const PREFIX = './pages';
const SUFFIX = '.tsx';

const ROOT_FOLDER = './pages';

const SPECIAL_DOCUMENT_FILE = '_document';

const rawFiles = glob.sync(ROOT_FOLDER + '/**/*');

const BASE_URL = 'https://tfm-henna.vercel.app';

let files = rawFiles
    .filter(dir => dir.endsWith(SUFFIX))
    .map(dir => dir.slice(PREFIX.length).replace('[id]', '1').replace('[name]', 1))
    .map(dir => dir.slice(0, dir.length - SUFFIX.length))
    .filter(dir => !dir.endsWith(SPECIAL_DOCUMENT_FILE))
    .map(dir => BASE_URL + dir);

const FOUR_MINUTES = 60 * 1000 * 4;

let timeoutId;

// override what we generate locally (can't be generated in production sadly):

files = [
    'https://tfm-henna.vercel.app/api/cron-job',
    'https://tfm-henna.vercel.app/api/games',
    'https://tfm-henna.vercel.app/api/games/1',
    'https://tfm-henna.vercel.app/api/games/1/play',
    'https://tfm-henna.vercel.app/api/sessions',
    'https://tfm-henna.vercel.app/api/users',
    'https://tfm-henna.vercel.app/api/your-turn',
    'https://tfm-henna.vercel.app/games/1',
    'https://tfm-henna.vercel.app/index',
    'https://tfm-henna.vercel.app/login',
    'https://tfm-henna.vercel.app/logout',
    'https://tfm-henna.vercel.app/new-game',
    'https://tfm-henna.vercel.app/signup',
];

runCronJob();

async function runCronJob() {
    try {
        for (const file of files) {
            fetch(file);
        }

        timeoutId = setTimeout(runCronJob, FOUR_MINUTES);
    } catch (error) {
        clearTimeout(timeoutId);
        runCronJob();
    }
}

export default async (req, res) => {
    res.json({});
};
