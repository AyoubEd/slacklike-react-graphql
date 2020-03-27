import { ApolloServer, gql } from "apollo-server-express";
import express from "express";
import { withFilter } from "graphql-subscriptions";
import { createServer } from "http";
import mongoose from "mongoose";
import { StorageService, pubsub } from "./storage";
import cors from "cors";

let storageService = new StorageService();

mongoose.connect("mongodb://localhost:27017/chatapi", {
  useNewUrlParser: true
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
  console.log("Connection to mongoDB established!");
});

//[Schemas]
const typeDefs = gql`
  type User {
    id: Int
    firstname: String
    lastname: String
    email: String
    password: String
    createdat: String
    deleted: Boolean
  }
  input UserInput {
    id: Int
    firstname: String
    lastname: String
    email: String
    password: String
    createdat: String
    deleted: Boolean
  }

  type Message {
    id: Int
    author: String
    body: String
    deleted: Boolean
  }

  input MessageInput {
    id: Int
    author: String
    body: String
    deleted: Boolean
  }

  type Channel {
    name: String
    owner: String
    members: [User]
    messages: [Message]
    deleted: Boolean
  }

  type AuthPayload {
    token: String
    user: User
  }

  type Query {
    getUsers: [User]
    getUserById(id: Int!): User
    getUserByEmail(email: String!): User

    getChannels: [Channel]
    getChannel(name: String!): Channel
  }

  type Subscription {
    messageAdded(name: String!): [Message]
  }

  type Mutation {
    addUser(
      email: String!
      password: String!
      firstname: String!
      lastname: String!
    ): AuthPayload
    authUser(email: String!, password: String!): AuthPayload
    updateUser(
      email: String!
      password: String!
      firstname: String
      lastname: String
    ): User
    deleteUser(email: String!, password: String!): User

    addChannel(name: String!, owner: String!): Channel
    updateChannel(name: String!, newname: String!, owner: String!): Channel
    deleteChannel(name: String!, owner: String!): Channel
    addMessage(name: String!, author: String, body: String): [Message]
    editMessage(
      name: String!
      author: String!
      id: Int!
      newbody: String!
    ): [Message]
    deleteMessage(name: String!, author: String!, id: Int!): [Message]
    addMember(name: String!, owner: String!, email: String!): [User]
    deleteMember(name: String!, owner: String!, email: String!): [User]
  }
`;

//[resolvers]
const resolvers = {
  Query: {
    getUsers: () => {
      return storageService.getUsers();
    },
    getUserById: (parent, args) => {
      return storageService.getUserById(args.id);
    },
    getUserByEmail: (parent, args) => {
      return storageService.getUserByEmail(args.email);
    },
    getChannels: async (parent, args, context) => {
      const user = await storageService.getUserByEmail(context.user.email);
      if (user) {
        return storageService.getChannels();
      }
    },
    getChannel: (parent, args) => {
      return storageService.getChannel(args.name);
    }
  },
  Mutation: {
    addUser: async (parent, args) => {
      return storageService.addUser(
        args.email,
        args.password,
        args.firstname,
        args.lastname
      );
    },
    authUser: (parent, args) => {
      return storageService.authUser(args.email, args.password);
    },
    updateUser: (parent, args) => {
      return storageService.updateUser(args);
    },
    deleteUser: (parent, args) => {
      return storageService.deleteUser(args);
    },
    addChannel: (parent, args) => {
      return storageService.addChannel(args.name, args.owner);
    },
    updateChannel: (parent, args) => {
      return storageService.updateChannel(args.name, args.newname, args.owner);
    },
    deleteChannel: (parent, args) => {
      return storageService.deleteChannel(args.name, args.owner);
    },
    addMessage: (parent, args) => {
      return storageService.addMessageToChannel(
        args.name,
        args.author,
        args.body
      );
    },
    editMessage: (parent, args) => {
      return storageService.editMessageInChannel(
        args.name,
        args.author,
        args.id,
        args.newbody
      );
    },
    deleteMessage: (parent, args) => {
      return storageService.deleteMessageInChannel(
        args.name,
        args.author,
        args.id
      );
    },
    addMember: (parent, args) => {
      return storageService.addMember(args.name, args.owner, args.email);
    },
    deleteMember: (parent, args) => {
      return storageService.deleteMember(args.name, args.owner, args.email);
    }
  },
  Subscription: {
    messageAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator("messageAdded"),
        (payload, variables) => {
          return payload.name === variables.name;
        }
      )
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req, connection }) => {
    if (connection) {
      return {
        ...connection.context,
        pubsub
      };
    } else {
      const token = req.headers["authorization"] || "";
      if (token)
        return {
          user: await storageService.getUserByToken(token)
        };
    }
  }
});

const app = express();

var corsOptions = {
  origin: "http://localhost:3000",
  credentials: true
};
app.use(cors(corsOptions));

server.applyMiddleware({ app });

const httpServer = createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen({ port: 4000 }, () => {
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
  console.log(
    `🚀 Subscriptions ready at ws://localhost:4000${server.subscriptionsPath}`
  );
});
