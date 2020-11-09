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
      context: ({ req, res, }) => {
        const context = new Context();
        context.req = req;
        context.res = res;
        return context
      }
    });
  
    apolloServer.installSubscriptionHandlers(httpServer);
    apolloServer.applyMiddleware({ app, cors: false });
    
    // httpServer.listen(4000, () => {
    //   console.log(`Server ready at http://localhost:4000${apolloServer.graphqlPath}`)
    //   console.log(`Subscriptions ready at ws://localhost:4000${apolloServer.subscriptionsPath}`);
    // });

    httpServer.listen(4000, "10.1.16.186", () => {
      console.log(`Server ready at http://10.1.16.186:4000${apolloServer.graphqlPath}`)
      console.log(`Subscriptions ready at ws://10.1.16.186:4000${apolloServer.subscriptionsPath}`);
    })
};
  
main();
  