import * as Express from 'express';
import * as cors from 'cors';
import * as ExpressSession from 'express-session';
import * as mongoConnect from 'connect-mongo';
import dbConnection from './config/Mongo.Config';
import { mongoose } from '@typegoose/typegoose'; 

require('dotenv').config();
require('./config/Redis.Config');


const app = Express();

dbConnection(process.env.DB_CONNECTION);
const MongoStore = mongoConnect(ExpressSession);
const connectSession = ExpressSession({
  secret: process.env.MONGO_SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: {
    maxAge: 60 * 60 * 1000,
    secure: false,
    sameSite: "none"
  }
})
app.use(cors({
  origin: ['http://10.1.16.186:3000', 'http://10.1.16.188:3000', 'http://localhost:3000', 'http://10.1.16.187:3000', 'http://10.1.16.189:3001'],
  allowedHeaders: ['X-Requested-With', 'X-HTTP-Method-Override', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true,
  methods: ['POST', 'GET'],
}));

app.use(connectSession);

export default app;