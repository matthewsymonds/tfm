import {Session} from 'database';
import {NextApiRequest, NextApiResponse} from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    let session: Session | undefined;

    switch (req.method?.toUpperCase()) {
        case 'POST':
        // Todo
        default:
            res.status(400);
            res.json({
                error: 'Unable to interpret request.',
            });
    }
};
