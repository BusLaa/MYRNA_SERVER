const { ApolloServer } = require("apollo-server-express"); 
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core'); 
const { makeExecutableSchema } = require('@graphql-tools/schema');

const express = require("express"); 
const http = require("http")
const cors = require('cors')

const sequelize = require("./connector").sequelize;
const models = sequelize.models;

const PORT = 4000;


// importing types 
const { UserTypes } = require('./Schema/TypeDefs/User');
const { PostTypes } = require('./Schema/TypeDefs/Post');
const { MeetingTypes } = require('./Schema/TypeDefs/Meeting');
const {LocationTypes} = require(`./Schema/TypeDefs/Location`)
const {ConversationTypes} = require(`./Schema/TypeDefs/Conversation`)

//importing resolvers 
const { UserResolvers } = require('./Schema/Resolvers/User');
const { PostResolvers } = require('./Schema/Resolvers/Post');
const {MeetingResolvers} = require('./Schema/Resolvers/Meeting');
const {LocationResolvers} = require(`./Schema/Resolvers/Location`)
const {ConversationResolvers} = require('./Schema/Resolvers/Conversation');
const giveSocket = require("./tools/socket");

// defining schema 
const schema = makeExecutableSchema({ 
    typeDefs:  [ UserTypes , PostTypes, MeetingTypes, LocationTypes, ConversationTypes], 
    resolvers: [ UserResolvers , PostResolvers, MeetingResolvers, LocationResolvers, ConversationResolvers],
})

const startApolloServer = async (schema) => { 
    const app = express(); 
    const httpServer = http.createServer(app); 
    
    const server = new ApolloServer({ 
        schema,
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer })
        ],
        introspection: true,
        context: ({req, res}) => ({req, res}),
        cors: {

            origin: "*"
        
          }
    });

    await server.start() 

    app.use(cors())
    app.use('/static', express.static('public'))
    server.applyMiddleware({ app, path: '/' }); 
    await httpServer.listen(process.env.PORT || 4001, () => { 
        console.log("Server succesfully started")
    })

    giveSocket()
    
}

startApolloServer(schema);
