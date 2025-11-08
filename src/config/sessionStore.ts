import MongoStore from 'connect-mongo';
import session from 'express-session';
import { env } from './env';

export const sessionConfig: session.SessionOptions = {
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: env.MONGODB_URI,
    ttl: 60 * 60 * 24, // 1 day
    autoRemove: 'native',
  }),
  cookie: {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
};


