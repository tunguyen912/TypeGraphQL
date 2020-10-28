import * as Express from 'express';
import * as cors from 'cors';
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
    maxAge: 60*60*1000,
    secure: false
  }
})
app.use(cors({
  origin: 'http://localhost:3000',
  allowedHeaders:['X-Requested-With','X-HTTP-Method-Override','Content-Type','Accept','Authorization'],
  credentials:true,
  methods:['POST','GET']
}))
app.use(connectSession);

export default app;