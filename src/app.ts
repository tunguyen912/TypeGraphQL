import * as Express from 'express';
import * as ExpressSession from 'express-session';
import * as mongoConnect from 'connect-mongo';
import dbConnection from './config/mongoConfig';
import { mongoose } from '@typegoose/typegoose';

require('dotenv').config()

const app = Express();

dbConnection(process.env.DB_CONNECTION);
const MongoStore = mongoConnect(ExpressSession);
const connectSession = ExpressSession({
  secret: process.env.MONGO_SESSION_SECRET,
  resave: false, 
  saveUninitialized: true,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: {
    maxAge: 60*60*1000
  }
})
// const sessionOptions = {
//     secret: process.env.SESSION_SECRET_KEY,
//     cookie: {
//       maxAge: 60000
//     },
//     saveUninitialized: true,
//     resave: true
// };
// app.use(ExpressSession(sessionOptions));
app.use(connectSession);

export default app;