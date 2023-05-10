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
const TypeDefs = require('./Schema/TypeDefs/index')

//importing resolvers 
const Resolvers = require('./Schema/Resolvers/index')

const giveSocket = require("./tools/socket");
const uploader = require('./tools/uploader')

// defining schema 
const schema = makeExecutableSchema({ 
    typeDefs:  TypeDefs, 
    resolvers: Resolvers,
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
    app.use(uploader)
    server.applyMiddleware({ app, path: '/' }); 
    await httpServer.listen(process.env.PORT || 4000, () => { 
        console.log("Server succesfully started")
    })

    giveSocket(httpServer)
    
}

startApolloServer(schema);
