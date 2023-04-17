const sequelize = require("../../connector").sequelize;
const models = sequelize.models;

const {isRolesInUser} = require('../../tools/FindUserRolesTool')

const getUserRoles = async (userId ) =>{
    const resp = await models.User.findOne({where: {id: userId}, include: 'Roles'}).then((resp) => resp.Roles)
    return resp
}

const LocationResolvers = {
    Query: {
        getAllConversations: async (_, )=>{
            return models.Conversation.findAll()
        },
    },
    Mutation:{
        createConversation: async (_, {name, idea, expandable}) =>{
            let user;
            try{
                user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;
                if (!isRolesInUser(await getUserRoles(user.id), ["ADMIN"])) throw Error("You do not have rights")
            } catch {
                throw Error("You do not have rights")   
            }
            const createdConversation = await sequelize.transaction(async (t) =>{
                const conversation = await models.Conversation.create({
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
module.exports = {LocationResolvers}