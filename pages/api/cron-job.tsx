const glob = require('glob');

const PREFIX = './pages';
const SUFFIX = '.tsx';

const ROOT_FOLDER = './pages';

const SPECIAL_DOCUMENT_FILE = '_document';

const rawFiles = glob.sync(ROOT_FOLDER + '/**/*');

const BASE_URL = 'https://tfm-henna.vercel.app';

const files = rawFiles
    .filter(dir => dir.endsWith(SUFFIX))
    .map(dir => dir.slice(PREFIX.length).replace('[id]', '1').replace('[name]', 1))
    .map(dir => dir.slice(0, dir.length - SUFFIX.length))
    .filter(dir => !dir.endsWith(SPECIAL_DOCUMENT_FILE))
    .map(dir => BASE_URL + dir);

const FOUR_MINUTES = 60 * 1000 * 4;

let timeoutId;

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
    res.json({files});
};
