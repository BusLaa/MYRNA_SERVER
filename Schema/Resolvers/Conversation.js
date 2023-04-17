const {verify} = require ('jsonwebtoken');
const sequelize = require("../../connector").sequelize;
const models = sequelize.models;

const {isRolesInUser} = require('../../tools/FindUserRolesTool')

const getUserRoles = async (userId ) =>{
    const resp = await models.User.findOne({where: {id: userId}, include: 'Roles'}).then((resp) => resp.Roles)
    return resp
}

const ConversationResolvers = {
    Query: {
        getAllConversations: async (_,__ , ctx)=>{
            return models.Conversations.findAll()
        },
    },
    Mutation:{
        createConversation: async (_, {name, idea, expandable}, ctx) =>{
            let user;
            try{
                user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;
            } catch {
                throw Error("You do not have rights")   
            }
            console.log(user.id)
            const createdConversation = await sequelize.transaction(async (t) =>{
                const conversation = await models.Conversations.create({
                    name: name,
                    idea: idea,
                    expandable: expandable
                }, {transaction: t});

                await models.UserConversations.create({
                    UserId: user.id,
                    ConversationId: conversation.id
                }, {transaction: t});

                return conversation
            })

            return createdConversation;

        }
    },
    Conversation: {
        
    },


}
module.exports = {ConversationResolvers }