const {verify} = require ('jsonwebtoken');

const { Op } = require("sequelize");
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

        },
        deleteConversation: async (_, {conversationId, userId}, ctx) =>{
            const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;

            const userConversation = await models.UserConversations.findOne({where: {
                [Op.and]: [
                    {
                        UserId:{
                            [Op.eq]: userId
                        }
                    },
                    {
                        ConversationId:{
                            [Op.eq]: conversationId
                        }
                    }
                ]
            }})

            if (!isRolesInUser(await getUserRoles(user.id), ["ADMIN"])
            && (userConversation) === null)
                throw Error("You do not have rights")

            const users = await models.UserConversations.findAll({where: {conversationId : conversationId}});

            await userConversation.destroy();
            if (users.length > 1) {return true}
            await models.Conversations.destroy({where: {id: conversationId}})
            return true
        }
    },
    Conversation: {
        
    },


}
module.exports = {ConversationResolvers }