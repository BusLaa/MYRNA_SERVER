const PostQueries = require('../../queries/MeetingQueries')
const MeetingQueries = require('../../queries/MeetingQueries')
const UserQueries = require('../../queries/UserQueries')
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
  UserLikes: UserLikes,
  Comment: Comment,
  Role: Role,
  UserRoles: UserRoles,
  MeetingType: MeetingType,
  Meeting: Meeting,
  UserMeetings: UserMeetings,
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
            return PostQueries.getAllMeetings();
        },
    },
    Mutation: {
        createNewMeeting: async (_, {name,date, type, creator,status}) => {

            const meeting = await models.Meeting.create({
                name: name,
                date: date,
                type: type,
                creator: creator,
                status: status
            })

            await models.UserMeetings.create({
                MeetingId: meeting.id,
                UserId, creator
            })

            meeting.date = new Date(meeting.date).toDateString()
            return meeting
        },
        inviteUserToMeeting: async (_, {meetingId, userId}, ctx) => {

            const checkIfUserInMeeting = (user_id, members)=>{
                for (i of members) {
                    if (i.id == user_id){
                        return true;
                    }
                } 
                return false
            } 
            const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;

            if (!isRolesInUser(await getUserRoles(user.id), ["ADMIN"])
            || (models.UserMeetings.findOne({where: {
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
            }}) === null))
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

            console.log(await MeetingQueries.getAllMeetingMembers(meeting_id))
            if (!isRolesInUser(await getUserRoles(user.id), ["ADMIN"])
            || (models.UserMeetings.findOne({where: {
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
            }}) === null))
                throw Error("You do not have rights (basically woman)")

            const users = await MeetingQueries.getAllMeetingMembers(meeting_id);


            await MeetingQueries.removeMeetingUser(meeting_id, user_id);
            if (users.length > 1) {return true}
            await MeetingQueries.deleteMeeting(meeting_id)
            return true
        },
        changeMeeting: async (_, {meeting_id, name, date}, ctx) => {
            const checkIfUserInMeeting = (user_id, members)=>{
                for (i of members) {
                    if (i.id == user_id){
                        return true;
                    }
                    return false
                } 
            } 
            try{
                const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;

                if (!isRolesInUser(await UserQueries.getAllUserRoles(user.id), ["ADMIN"]) 
                && !checkIfUserInMeeting(user.id, await MeetingQueries.getAllMeetingMembers(meeting_id)))
                    throw Error("You do not have rights (basically woman)")

            } catch (err){
                throw Error("You do not have rights (basically woman)")
            }
            
            MeetingQueries.changeMeeting(meeting_id, name, date);
            return MeetingQueries.getMeetingById(meeting_id)
        },
        makeChief: async (_, {meeting_id, user_id}, ctx) =>{
            const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;

            console.log(await MeetingQueries.getMeetingById(meeting_id))
            const meeting = await (MeetingQueries.getMeetingById(meeting_id));
            if (!(isRolesInUser(await UserQueries.getAllUserRoles(user.id), ["ADMIN"]) 
            || (meeting.chief == user.id)))
                throw Error("You do not have rights (basically woman)")
            MeetingQueries.updateMeetingChief(meeting_id, user_id)
            return true
        },
        makeImportant: async (_, {meeting_id, user_id}, ctx) => {
            MeetingQueries.updateImportantUserMeetings(meeting_id, user_id)
            const res = await MeetingQueries.getUserMeetingByUserIdAndMeetingId(meeting_id, user_id)
            return res.important
        }
    },
    Meeting:{
        type: async (meeting) =>{
            return (await MeetingQueries.getMeetingType(meeting.id)).name
        },
        members: async (meeting) => {
            return MeetingQueries.getAllMeetingMembers(meeting.id)
        },
        creator: async (meeting) => {
            return MeetingQueries.getMeetingCreator(meeting.id);
        },
        places: async (meeting) => {
            return models.PlaceMeeting.findAll({where: {MeetingId: meeting.id}})
        },
        chief: async (meeting) =>{
            return MeetingQueries.getChiefByMeetingId(meeting.id)
        },
        messages: async (meeting) => {
            return MeetingQueries.getAllMeetingMessages(meeting.id)
        }
    }
}
module.exports = {MeetingResolvers}