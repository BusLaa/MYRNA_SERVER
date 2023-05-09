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

const CornerResolvers = {
    Query: {
    },
    Mutation:{
        addPlaceToCorner: async (_, {userId, placeId}, ctx) => {
            const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;
            if (!isRolesInUser(await getUserRoles(user.id), ["ADMIN"]) && user.id !== userId ) throw Error("You do not have rights")

            const cornerPlace = models.CornerPlace.create({
                userId: userId,
                placeId: placeId
            })

            if (!cornerPlace) throw Error("something went wrong when creating corner place")

            else return true
        } ,
        addPostToCorner: async (_, {userId, postId}, ctx) => {
            const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;
            if (!isRolesInUser(await getUserRoles(user.id), ["ADMIN"]) && user.id !== userId ) throw Error("You do not have rights")

            const cornerPost = models.CornerPost.create({
                userId: userId,
                postId: postId
            })
            
            if (!cornerPost) throw Error("something went wrong when creating corner post")

            else return true
        } 
    }
}
module.exports = {CornerResolvers }