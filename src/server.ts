import "reflect-metadata";
import { ApolloServer, PubSub } from 'apollo-server-express';

import { RegisterResolver } from './schema/user/registerSchema';
import { LoginResolver } from './schema/user/loginSchema';
import { LogoutResolver } from "./schema/user/logoutSchema";

import { buildSchema } from "type-graphql";
import app from './app';

import { Context } from './model/types/Context';
import { messageResolver } from "./schema/message/createMessage";
import { createServer } from 'http';


const httpServer = createServer(app)
const pubSub = new PubSub()
const main = async () => {
    const schema = await buildSchema({
      resolvers: [RegisterResolver, LoginResolver, LogoutResolver, messageResolver],
      pubSub
    });
  
    const apolloServer = new ApolloServer({ 
      schema,
      context: ({ req }) => {
        const context = new Context();
        context.req = req;
        return context
      }  
     });
  
    apolloServer.installSubscriptionHandlers(httpServer)
    apolloServer.applyMiddleware({ app });
    
    httpServer.listen(4000, () => {
      console.log(`Server ready at http://localhost:4000/${apolloServer.graphqlPath}`)
      console.log(`Subscriptions ready at ws://localhost:4000/${apolloServer.subscriptionsPath}`);
    });
};
  
main();
  