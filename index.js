const { ApolloServer, PubSub } = require("apollo-server");
const mongoose = require("mongoose");
const env = require("dotenv");
env.config();

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers/index");

const pubsub = new PubSub();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req, pubsub }),
});

mongoose
  .connect(process.env.DB_TOKEN, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("db connected"));
  .catch(err => {
    console.error(err)
  })

server.listen({ port: 5000 }).then((res) => {
  console.log(`server is running at ${res.url}`);
});
