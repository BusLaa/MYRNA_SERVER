const {verify, sign} = require ('jsonwebtoken');
const {isRolesInUser} = require('../../tools/FindUserRolesTool');


const { Op } = require("sequelize");
const { MeetingTypes } = require('../TypeDefs/Meeting');
const sequelize = require("../../connector").sequelize;
const models = sequelize.models;

/* 
{
  User: User,
  UserSubscription: UserSubscription,
  Post: Post,
  UserLikes: UserLikes,
  Comment: Comment,
  Role: Role,
  UserRoles: UserRoles,
  MeetingType: MeetingType,
  Meeting: Meeting,
  UserMeeting: UserMeeting,
  meetingMsg: meetingMsg,
  location: location,
  Place: Place,
  image: image,
  PlaceMeetings: PlaceMeetings,
  MeetingImgs: MeetingImgs,
  UserImgs: UserImgs,
  rating: rating
}
*/
const getUserRoles = async (userId ) =>{
    const resp = await models.User.findOne({where: {id: userId}, include: 'Roles'}).then((resp) => resp.Roles)
    return resp
}


const MeetingResolvers = {
    Query: {
        getAllMeetings: () =>{
            return models.Meeting.findAll();
        },
    },
    Mutation: {
        createNewMeeting: async (_, {name,date, type, creator,status}) => {

            const created = await sequelize.transaction(async (t)=>{
                const meeting = await models.Meeting.create({
                    name: name,
                    date: date,
                    typeId: type,
                    creator: creator,
                    status: status,
                    chief: creator
                }, {transaction:t})
    
                await models.UserMeeting.create({
                    MeetingId: meeting.id,
                    UserId: creator
                }, {transaction:t})

                return meeting
            })
            

            created.date = new Date(created.date).toDateString()
            return created
        },
        inviteUserToMeeting: async (_, {meetingId, userId}, ctx) => {

            const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;

            if (!isRolesInUser(await getUserRoles(user.id), ["ADMIN"])
            || ((await models.UserMeetings.findOne({where: {
                [Op.and]: [
                    {
                        UserId:{
                            [Op.eq]: user.id
                        }
                    },
                    {
                        MeetingId:{
                            [Op.eq]: meetingId
                        }
                    }
                ]
            }})) === null))
                throw Error("You do not have rights (basically woman)")

            try{
                models.UserMeetings.create({UserId: userId, MeetingId: meetingId})
            } catch (err) {
                return null
            }
            return models.User.findOne({where: {id : userId}})
        },
        createMeetingMessage: async (_, {meetingId, author,content, referenceMessageId}) =>{
            const meeting = await models.MeetingMsg.create({
                content: content,
                authorId: author,
                meetingId: meetingId,
                referenceMsgId: referenceMessageId
            })
            meeting.author = meeting.authorId;
            return meeting;
        },
        deleteMeeting: async (_, {meetingId, userId}, ctx) => {

            const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;

            const userMeeting = await models.UserMeeting.findOne({where: {
                [Op.and]: [
                    {
                        UserId:{
                            [Op.eq]: userId
                        }
                    },
                    {
                        MeetingId:{
                            [Op.eq]: meetingId
                        }
                    }
                ]
            }})
            console.log(userMeeting)

            if (!isRolesInUser(await getUserRoles(user.id), ["ADMIN"])
            && (userMeeting) === null)
                throw Error("You do not have rights (basically woman)")

            const users = await models.UserMeeting.findAll({where: {meetingId : meetingId}});

            await userMeeting.destroy();
            if (users.length > 1) {return true}
            await models.Meeting.destroy({where: {id: meetingId}})
            return true
        },
        changeMeeting: async (_, {meetingId, name, date}, ctx) => {
            const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;

            if (!isRolesInUser(await getUserRoles(user.id), ["ADMIN"])
            || ((await models.UserMeetings.findOne({where: {
                [Op.and]: [
                    {
                        UserId:{
                            [Op.eq]: user.id
                        }
                    },
                    {
                        MeetingId:{
                            [Op.eq]: meetingId
                        }
                    }
                ]
            }})) === null))
                throw Error("You do not have rights (basically woman)")


            const meeting = models.Meeting.findOne({where : {id : meetingId}})
            
            meeting.name = name;
            meeting.date = date
            meeting.update()
            return meeting
        },
        makeChief: async (_, {meetingId, userId}, ctx) =>{
            const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;

            const meeting = await models.Meeting.findOne({where: {id : meetingId}});

            if (!isRolesInUser(await getUserRoles(user.id), ["ADMIN"])
            || (meeting.chief == user.id))
                throw Error("You do not have rights (basically woman)")
            
            meeting.chief = userId

            models.Meeting.update(meeting, {where: {id: meetingId}})
            return true
        },
        makeImportant: async (_, {meetingId, userId}, ctx) => {
            const userMeeting = await models.UserMeeting.findOne({where:{
                [Op.and]: [
                    {
                        UserId:{
                            [Op.eq]: userId
                        }
                    },
                    {
                        MeetingId:{
                            [Op.eq]: meetingId
                        }
                    }
                ]
            }
            })

            userMeeting.important = !userMeeting.important

            await models.UserMeeting.update(userMeeting, {where:{
                    [Op.and]: [
                        {
                            UserId:{
                                [Op.eq]: userId
                            }
                        },
                        {
                            MeetingId:{
                                [Op.eq]: meetingId
                            }
                        }
                    ]
                }
            })

            return userMeeting.important
        }
    },
    Meeting:{
        type: async (meeting) =>{
            const meetingType =await  models.Meeting.findOne({where: {id: meeting.id}});
            return (await models.MeetingType.findOne({where:{id : meetingType.id}})).name;
        },
        members: async (meeting) => {
            return models.UserMeeting.findAll({where: {meetingId: meeting.id}})
        },
        creator: async (meeting) => {
            return (await models.Meeting.findOne({where: {id: meeting.id}})).creator
        },
        places: async (meeting) => {
            return models.PlaceMeeting.findAll({where: {MeetingId: meeting.id}})
        },
        chief: async (meeting) =>{
            return (await models.Meeting.findOne({where: {id: meeting.id}})).chief
        },
        messages: async (meeting) => {
            return models.MeetingMsg.findAll({where: {meetingId: meeting.id}})
        }
    }
}
module.exports = {MeetingResolvers}