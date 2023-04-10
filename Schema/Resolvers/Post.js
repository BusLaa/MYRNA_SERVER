const queryTool = require('../../tools/QueryTool')
const {pool} = require("../../connector");
const {verify, sign} = require ('jsonwebtoken');
const {isRolesInUser} = require('../../tools/FindUserRolesTool');

const { Op } = require("sequelize");
const sequelize = require("../../connector").sequelize;
const models = sequelize.models;





const getUserRoles = async (userId ) =>{
    const resp = await models.User.findOne({where: {id: userId}, include: 'Roles'}).then((resp) => resp.Roles)
    return resp
}


const PostResolvers = { 
    Query: {
        getAllPosts: async () => {
            return await models.Post.findAll({where: {deleted: false}, order: [['id', 'DESC']]})
        },
        getPostById: async (_,{id}) => {
            return await models.Post.findOne({where: {id: id}})
        },
        getAllUserPostById: async (_,{id}) => {
            return await models.Post.findAll({where:{
                [Op.and]: [
                    {
                        authorId:{
                            [Op.eq]: id
                        }
                    },
                    {
                        deleted:{
                            [Op.eq]: false
                        }
                    }
                ]}
            })
        },
        /**
         ({where:{
                [Op.and]: [
                    {
                        authorId:{
                            [Op.eq]: id
                        }
                    },
                    {
                        deleted:{
                            [Op.eq]: false
                        }
                    }
                ]}
            })
         */
        getAllSubscribedPosts: async (_,{id}) =>{
            return models.Post.findAll({
                where: {
                    [Op.and]:[
                        {
                            author: [Op.in] (await models.User.findAll({where : {id : id}})).Subscribed
                        },
                        {
                            deleted:{
                                [Op.eq] : false
                            }
                        }
                    ]
                    
                }
            })
        },
        isPostLikedByUser: async(_, {postId, userId})=>{
            return (await models.UserLikes.findOne({where: {
                [Op.and]: [
                    {
                        PostId:{
                            [Op.eq]: postId
                        }
                    },
                    {
                        UserId:{
                            [Op.eq]: userId
                        }
                    }
                ]
            }})) === null ? false : true
        }
    },
    Mutation: {
        addNewPost: async (_,{userId, header, content}) => {
            return await models.Post.create({
                Author : userId,
                header: header,
                content: content
            })
            
        },
        addNewComment: async (_,{userId, postId, content}) => {
            return await models.Comment.create({
                AuthorId: userId,
                PostId: postId,
                content: content
            })
        },
        likePost: async (_, {userId, postId})=> {
            
            return sequelize.transaction(async (t) =>{
                const data = await models.UserLikes.findOne({where: {
                    [Op.and]: [
                        {
                            PostId:{
                                [Op.eq]: postId
                            }
                        },
                        {
                            UserId:{
                                [Op.eq]: userId
                            }
                        }
                    ]
                }})

                if (data === null){
                    await models.UserLikes.create({
                        PostId: postId,
                        UserId: userId
                    })
                    return true
                } else {
                    await data.destroy();
                    return false
                }
            })
        },
        deletePost: async (_, {postId}, ctx)=> {
            const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;
            const user_id = (await models.Post.findOne({where: {id: postId}})).Author
            if (!isRolesInUser(await getUserRoles(user.id), ["ADMIN"]) && user.id != user_id) throw Error("You do not have rights (basically woman)")

            models.Post.update({deleted: true}, {where: {id: postId}})
            return true;
        },
        deleteComment: async (_, {commentId}, ctx) =>{
            const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;
            const user_id = (await models.Comment.findOne({where: {id: commentId}})).AuthorId
            if (!isRolesInUser(await getUserRoles(user.id), ["ADMIN"]) && user.id != user_id) throw Error("You do not have rights (basically woman)")

            models.Comment.update({deleted: true}, {where: {id: commentId}})
            return true;
        }
    },
    Post: {
            comments: async  (post) => {
                return (await models.Post.findOne({where: {id : post.id}, include: "Comments"})).Comments
                .map((com) => {
                    if (com.deleted) com.content = "[DELETED]"
                    return com
                })
            },
            author: async (post) =>{
                return {id: (await models.Post.findOne({where: {id : post.id}})).Author}
            },
            likes: async (post) =>{
                return (await models.Post.findOne({where: {id : post.id}})).likes
            }
        },
    Comment: {
            author: async  (comment) => {
                return (await models.User.findOne({where: {id : comment.AuthorId}}))
            },
            post: async (comment) => {
                return await (await models.Post.findOne({where :{id : comment.PostId}}))
            }
        }
    }

module.exports = {
    PostResolvers
}