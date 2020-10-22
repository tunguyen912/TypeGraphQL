import "reflect-metadata";
import { ApolloServer } from 'apollo-server-express';
import { RegisterResolver } from './schema/user/registerSchema';
import { LoginResolver } from './schema/user/loginSchema';
import { buildSchema } from "type-graphql";
import app from './app';
import dbConnection from './config/mongoConfig';

require('dotenv').config()
dbConnection(process.env.DB_CONNECTION)

const main = async () => {
    const schema = await buildSchema({
      resolvers: [RegisterResolver, LoginResolver]
    });
  
    const apolloServer = new ApolloServer({ schema });
  
    apolloServer.applyMiddleware({ app });
  
    app.listen(4000, () => {
      console.log("server started on http://localhost:4000/graphql");
    });
};
  
main();
  