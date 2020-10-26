import * as Express from 'express';
import * as ExpressSession from 'express-session';
import dbConnection from './config/mongoConfig';
require('dotenv').config()


dbConnection(process.env.DB_CONNECTION)
const app = Express();
const sessionOptions = {
    secret: process.env.SESSION_SECRET_KEY,
    cookie: {
      maxAge: 60000
    },
    saveUninitialized: true,
    resave: true
};
app.use(ExpressSession(sessionOptions));

export default app;