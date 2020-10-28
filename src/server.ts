import "reflect-metadata";
import { ApolloServer } from 'apollo-server-express';
import { schema } from './schema/schema'

import app from './app';

import { Context } from './model/types/Context';
import { createServer } from 'http';


const httpServer = createServer(app)
const main = async () => {
  
    const apolloServer = new ApolloServer({ 
      schema,
      context: ({ req, res }) => {
        const context = new Context();
        context.req = req;
        context.res = res;
        return context
      }  
     });
  
    apolloServer.installSubscriptionHandlers(httpServer)
    apolloServer.applyMiddleware({ app, cors: false });
    
    httpServer.listen(8080, () => {
      console.log(`Server ready at http://localhost:8080/${apolloServer.graphqlPath}`)
      console.log(`Subscriptions ready at ws://localhost:8080/${apolloServer.subscriptionsPath}`);
    });
};
  
main();
  