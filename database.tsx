import bcrypt from 'bcryptjs';
import cookie from 'cookie';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import absoluteUrl from 'next-absolute-url';
import isEmail from 'validator/lib/isEmail';

const uniqueNameSchema = {
    type: String,
    unique: true,
    required: true,
    dropDups: true,
    // alphanumeric, plus underscore and hyphen
    validate: /^[a-zA-Z0-9_-]*$/,
};

const sessions: {[token: string]: {username: string}} = {};

const schema = mongoose.Schema;

export const db = mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});

const gamesSchema = new schema({
    name: uniqueNameSchema,
    state: {type: Object, index: true},
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
});

export let gamesModel;

try {
    gamesModel = mongoose.model('games');
} catch (error) {
    gamesModel = mongoose.model('games', gamesSchema);
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

usersSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
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

export const sessionsSchema = new schema({
    username: {type: String, required: true},
    token: {type: String, required: true, default: getToken},
    expiresAt: {
        type: Date,
        default: Date.now,
        index: {expires: '100d'},
    },
});

export let sessionsModel;

try {
    sessionsModel = mongoose.model('sessions');
} catch (error) {
    sessionsModel = mongoose.model('sessions', sessionsSchema);
}

export async function retrieveSession(req, res) {
    const cookies = req.headers.cookie || '';

    const cookiesObject = cookie.parse(cookies);

    const token = cookiesObject.session;

    if (!token) {
        handleRedirect(req, res);
        return;
    }
    let payload: {username: string};
    try {
        payload = jwt.verify(token, process.env.TOKEN_SECRET as string);
    } catch (error) {
        handleRedirect(req, res);
        return;
    }
    if (!payload?.username) {
        handleRedirect(req, res);
    }
    return payload;
}

export function appendSecurityCookieModifiers(
    secure: boolean,
    domain: string,
    originalCookie: string
): string {
    originalCookie += `; Path=/`;
    originalCookie += '; HttpOnly';
    if (secure) {
        originalCookie += '; Secure';
    }
    return originalCookie;
}

export function handleRedirect(req, res) {
    const theCookie = appendSecurityCookieModifiers(
        req.secure,
        absoluteUrl(req).origin,
        `session=; Max-Age=-1`
    );
    res.writeHead(404, {
        'Set-Cookie': theCookie,
        Location: '/login',
    });
    res.end();
}

function getToken(): string {
    return crypto.randomBytes(16).toString('base64');
}
