const queryTool = require('../../tools/QueryTool')
const {pool} = require("../../connector");
const {verify, sign} = require ('jsonwebtoken');
const {isRolesInUser} = require('../../tools/FindUserRolesTool');

const { Op } = require("sequelize");
const sequelize = require("../../connector").sequelize;
const models = sequelize.models;



/* 
{
  User: User,
  UserSubscription: UserSubscription,
  Post: Post,
  Comment: Comment,
  Role: Role,
  UserRoles: UserRoles,
  MeetingType: MeetingType,
  Meeting: Meeting,
  UserMeetings: UserMeetings,
  meetingMsg: meetingMsg,
  userLikes: userLikes,
  location: location,
  Place: Place,
  image: image,
  MeetingImgs: MeetingImgs,
  UserImgs: UserImgs,
  rating: rating
}
*/

const getUserRoles = async (userId ) =>{
    const resp = await models.User.findOne({where: {id: userId}, include: 'Roles'}).then((resp) => resp.Roles)
    return resp
}

const PostResolvers = { 
    Query: {
        getAllPosts: async () => {
            return await models.Post.findAll({})
        },
        getPostById: async (_,{id}) => {
            return await models.Post.findOne({where: {id: id}})
        },
        getAllUserPostById: async (_,{id}) => {
            return await models.Post.findAll({where: {authorId: id}})
        },
        getAllSubscribedPosts: async (_,{id}) =>{
            return models.Post.findAll({
                where: {
                    author: (await models.User.findAll({where : {id : id}})).Subscribed
                }
            })
        },
        isPostLikedByUser: async(_, {postId, userId})=>{
            return (await models.userLikes.findOne({where: {
                [Op.and]: {
                    postId: postId,
                    userId: userId
                }
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
                userId: userId,
                postId: postId,
                content: content
            })
        },
        likePost: async (_, {userId, postId})=> {
            
            return sequelize.transaction(async (t) =>{
                const data = 
                await models.UserLikes.findOne({where: {
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
                    await data.destroy()
                    return false
                }
            })
        },
        deletePost: async (_, {postId}, ctx)=> {
            const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;
            const user_id = (await models.findOne({where: {id: postId}})).Author
            if (!isRolesInUser(await getUserRoles(user.id), ["ADMIN"]) && user.id != user_id) throw Error("You do not have rights (basically woman)")

            models.Post.update({deleted: true}, {where: {id: postId}})
            return true;
        },
        deleteComment: async (_, {commentId}, ctx) =>{
            const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;
            const user_id = (await models.findOne({where: {id: commentId}})).Author
            if (!isRolesInUser(await getUserRoles(user.id), ["ADMIN"]) && user.id != user_id) throw Error("You do not have rights (basically woman)")

            models.Comment.update({deleted: true}, {where: {id: postId}})
            return true;
        }
    },
    Post: {
            comments: async  (post) => {
                return (await models.Post.findOne({where: {id : post.id}, include: "Comments"})).Comments
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