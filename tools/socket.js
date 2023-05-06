const  socketIO = require('socket.io')
const giveSocket = (httpServer) =>{
    const io = socketIO(httpServer, {
        cors: {
            origin: "*"
      }})
    io.on("connection", (socket) => {
        //console.log("Connection established")

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

            const returnVal = await models.User.findOne({where: {id: message.authorId}})
            message.author = returnVal.toJSON()
            io.to("room"+ args.conversationId).emit("newMessage", message);
        })
    })
}
module.exports = giveSocket