import * as Express from 'express';
import * as ExpressSession from 'express-session';

const app = Express();

const sessionOptions = {
    secret: '123456',
    cookie: {
      maxAge: 60000
    },
    saveUninitialized: true,
    resave: true
};

app.use(ExpressSession(sessionOptions));

export default app;