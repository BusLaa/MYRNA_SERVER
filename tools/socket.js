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
            if (args.type === "conversation") {
                socket.join("room/Conversation/" + args.conversationId);
                io.to(socket.id).emit("gotId", "room/Conversation/" + args.conversationId)               
            } else if (args.type === "meeting") {
                socket.join("room/Meeting/" + args.conversationId);
                io.to(socket.id).emit("gotId", "room/Meeting/" + args.conversationId)                
            }
        })
        socket.on("sentMessage", async (args) => {
            let message = {}
            if (args.type === "conversation") {
                message = (await models.ConversationMsg.create({
                    conversationId: args.conversationId,
                    authorId: args.authorId,
                    referenceMsgId : args.referenceId,
                    content : args.content
                })).toJSON();
            } else if (args.type === "meeting") {
                message = (await models.MeetingMsg.create({
                    meetingId: args.conversationId,
                    authorId: args.authorId,
                    referenceMsgId : args.referenceId,
                    content : args.content
                })).toJSON();
            }

            models.User.findOne({
                attributes: ['email', 'firstName', 'lastName', 'id'], 
                where: {id: message.authorId}, 
                include :"avatar"})
            .then((returnVal) =>{
                message.author = returnVal.toJSON()
                if (args.type === "conversation") {
                    io.to("room/Conversation/" + args.conversationId).emit("newMessage", message);             
                } else if (args.type === "meeting") {
                    io.to("room/Meeting/" + args.conversationId).emit("newMessage", message);           
                }
            })
            .catch((err) =>{
                console.log(err)
            })
            
            
            
        })
    })
}
module.exports = giveSocket