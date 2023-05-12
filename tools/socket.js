const  socketIO = require('socket.io')

const sequelize = require("../connector").sequelize;
const models = sequelize.models;

const giveSocket = (httpServer) =>{
    const io = socketIO(httpServer, {
        cors: {
            origin: "*"
      }})
    io.on("connection", (socket) => {

        socket.on("askForRoom", (args) => {
            socket.join("room" + args.conversationId);
            io.to(socket.id).emit("gotId", "room" + args.conversationId)
        })
        socket.on("sentMessage", async (args) => {
            const message = (await models.ConversationMsg.create({
                conversationId: args.conversationId,
                authorId: args.authorId,
                referenceMsgId : args.referenceId,
                content : args.content
            })).toJSON();

            models.User.findOne({
                attributes: ['email', 'firstName', 'lastName', 'id'], 
                where: {id: message.authorId}, 
                include :"avatar"})
            .then((returnVal) =>{
                message.author = returnVal.toJSON()
                io.to("room"+ args.conversationId).emit("newMessage", message);
            })
            .catch((err) =>{
                console.log(err)
            })
            
            
            
        })
    })
}
module.exports = giveSocket