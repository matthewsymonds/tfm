import bcrypt from 'bcryptjs';
import {TFMSession} from 'check-session';
import cookie from 'cookie';
import {IncomingMessage, ServerResponse} from 'http';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import isEmail from 'validator/lib/isEmail';

const uniqueNameSchema = {
    type: String,
    unique: true,
    required: true,
    dropDups: true,
    // alphanumeric, plus underscore and hyphen
    validate: /^[a-zA-Z0-9_-]*$/,
};

const schema = mongoose.Schema;

export const db = mongoose.connect(process?.env?.MONGODB_URI ?? '', {
    autoIndex: true,
});

const gamesSchema = new schema(
    {
        name: uniqueNameSchema,
        state: {type: Object, index: true},
        stateCheckpoint: {type: String},
        queueCheckpoint: {type: String},
        players: {type: Array, default: [], index: true},
        queue: {type: Array, default: []},
        public: {type: Boolean, default: false},
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
        currentPlayer: {type: String, default: ''},
        lastSeenLogItem: {type: Array, default: []},
    },
    {
        minimize: false,
    }
);

export let gamesModel;

try {
    gamesModel = mongoose.model('games');
} catch (error) {
    gamesModel = mongoose.model('games', gamesSchema);
}

const forgotPasswordSchema = new schema({
    username: String,
    token: String,
    createdAt: {type: Date, expires: '15m', default: Date.now},
});

export let forgotPasswordModel;

try {
    forgotPasswordModel = mongoose.model('forgotPassword');
} catch (error) {
    forgotPasswordModel = mongoose.model(
        'forgotPassword',
        forgotPasswordSchema
    );
}

const errorLogsSchema = new schema({
    username: String,
    gameName: String,
    createdAt: {type: Date, default: Date.now},
    attemptedAction: String,
    error: String,
});

export let errorLogsModel;

try {
    errorLogsModel = mongoose.model('errorLogModel');
} catch (error) {
    errorLogsModel = mongoose.model('errorLogModel', forgotPasswordSchema);
}

const usersSchema = new schema({
    username: uniqueNameSchema,
    email: {
        type: String,
        unique: true,
        required: true,
        dropDups: true,
        validate: {validator: isEmail, message: 'Invalid email.'},
    },
    password: {type: String, required: true},
});

// Increase the cost factor and passwords are harder to brute force,
// but take longer to hash.
const COST_FACTOR = 5;

usersSchema.pre('save', function (next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(COST_FACTOR, function (err, salt) {
        if (err) return next(err);

        // hash the password along with our new salt
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

usersSchema.methods.comparePassword = function (
    candidate: string
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        bcrypt.compare(candidate, this.password, function (error, isMatch) {
            if (error) reject(error);

            resolve(isMatch);
        });
    });
};

export let usersModel;

try {
    usersModel = mongoose.model('users');
} catch (error) {
    usersModel = mongoose.model('users', usersSchema);
}

export interface Session {
    username: string;
}

export async function retrieveSession(
    req: IncomingMessage,
    res: ServerResponse
) {
    const cookies = req.headers.cookie || '';

    const cookiesObject = cookie.parse(cookies);

    const token = cookiesObject.session;

    if (!token) {
        handleRedirect(res);
        return;
    }
    let payload: TFMSession;
    try {
        payload = jwt.verify(token, process.env.TOKEN_SECRET as string);
    } catch (error) {
        handleRedirect(res);
        return;
    }
    if (!payload?.username) {
        handleRedirect(res);
    }
    return payload;
}

export function appendSecurityCookieModifiers(originalCookie: string): string {
    originalCookie += `; Path=/`;
    originalCookie += '; HttpOnly';
    originalCookie += '; Secure';
    originalCookie += '; Max-Age=31536000';
    return originalCookie;
}

export function handleRedirect(res: ServerResponse) {
    const theCookie = appendSecurityCookieModifiers(`session=; Max-Age=-1`);
    res.writeHead(404, {
        'Set-Cookie': theCookie,
        Location: '/login',
    });
    res.end();
}
