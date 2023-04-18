const {verify} = require ('jsonwebtoken');

const { Op } = require("sequelize");
const sequelize = require("../../connector").sequelize;
const models = sequelize.models;

const {isRolesInUser} = require('../../tools/FindUserRolesTool')

const getUserRoles = async (userId ) =>{
    const resp = await models.User.findOne({where: {id: userId}, include: 'Roles'}).then((resp) => resp.Roles)
    return resp
}

const getUserConversation = async (conversationId, userId) => {
    return models.UserConversations.findOne({where: {
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

            const userConversation = await getUserConversation(conversationId, userId) 

            if (!isRolesInUser(await getUserRoles(user.id), ["ADMIN"])
            && (userConversation) === null)
                throw Error("You do not have rights")

            const users = await models.UserConversations.findAll({where: {conversationId : conversationId}});

            await userConversation.destroy();
            if (users.length > 1) {return true}
            await models.Conversations.destroy({where: {id: conversationId}})
            return true
        },
        createConversationMessage: async (_, {conversationId,authorId, referenceId, content}, ctx) =>{
            const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;

            const userConversation = await getUserConversation(conversationId, user.id) 

            if (!isRolesInUser(await getUserRoles(user.id), ["ADMIN"])
            && (userConversation) === null){
                throw Error("You do not have rights");
            }

            const message = models.ConversationMsg.create({
                conversationId: conversationId,
                authorId: authorId,
                referenceMsgId : referenceId,
                content : content
            });


            return await message;
            
            
        },
        inviteUserToConversation: async (_, {conversationId,userId}, ctx) =>{
            const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;


            const userConversation = await getUserConversation(conversationId, user.id) 

            if (!isRolesInUser(await getUserRoles(user.id), ["ADMIN"])
            && (userConversation) === null){
                throw Error("You do not have rights");
            }

            const userConv = await  models.UserConversations.create({
                ConversationId: conversationId,
                UserId: userId,
            });

            return {id: userConv.UserId};
        }
    },
    Conversation: {
        members: async (conversation) => {
            return (await models.UserConversations.findAll({where: {conversationId: conversation.id}})).map((a) =>{ return {id: a.UserId}})
        },
        messages: async (conversation) => {
            return (await models.ConversationMsg.findAll({where: {conversationId: conversation.id}}))
        }
    },
    ConversationMessage:{
        author: async (conversationMessage) =>{
            return await models.User.findOne({where: {id: conversationMessage.authorId}})
        }
    }


}
module.exports = {ConversationResolvers }