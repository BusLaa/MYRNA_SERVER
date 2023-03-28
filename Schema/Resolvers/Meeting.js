const PostQueries = require('../../queries/MeetingQueries')
const MeetingQueries = require('../../queries/MeetingQueries')
const UserQueries = require('../../queries/UserQueries')
const LocationQueries = require('../../queries/LocationQueries');
const {verify, sign} = require ('jsonwebtoken');
const {isRolesInUser} = require('../../tools/FindUserRolesTool');
const MeetingResolvers = {
    Query: {
        getAllMeetings: () =>{
            return PostQueries.getAllMeetings();
        },
    },
    Mutation: {
        createNewMeeting: async (_, {name,date, type, creator,status}) => {
            await MeetingQueries.createNewMeeting(name,date, type,status, creator)

            const meeting = await MeetingQueries.getLastMeeting();

            MeetingQueries.addMeetingUser(meeting.id, creator);

            meeting.date = new Date(meeting.date).toDateString()
            return meeting
        },
        inviteUserToMeeting: async (_, {meeting_id, user_id}, ctx) => {

            const checkIfUserInMeeting = (user_id, members)=>{
                for (i of members) {
                    if (i.id == user_id){
                        return true;
                    }
                } 
                return false
            } 
            const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;

            if (!(isRolesInUser(await UserQueries.getAllUserRoles(user.id), ["ADMIN"]) 
            || checkIfUserInMeeting(user.id, await MeetingQueries.getAllMeetingMembers(meeting_id))))
                throw Error("You do not have rights (basically woman)")

            try{
                await MeetingQueries.addMeetingUser(meeting_id, user_id)
            } catch (err) {
                return null
            }
            return UserQueries.getUserById(user_id)
        },
        createMeetingMessage: async (_, {meeting_id, author,content, referenceMessageId}) =>{
            try{
                await MeetingQueries.addMeetingMessage(meeting_id, author, content, referenceMessageId);
            } catch (err){

            }
            return MeetingQueries.getLastMeetingMessage()
        },
        deleteMeeting: async (_, {meeting_id, user_id}, ctx) => {

            const checkIfUserInMeeting = (user_id, members)=>{
                for (i of members) {
                    if (i.id == user_id) return true;
                }
                return false 
            } 
            const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;

            console.log(await MeetingQueries.getAllMeetingMembers(meeting_id))
            if (!(isRolesInUser(await UserQueries.getAllUserRoles(user.id), ["ADMIN"]) 
            || checkIfUserInMeeting(user.id, await MeetingQueries.getAllMeetingMembers(meeting_id))))
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
            return LocationQueries.getPlacesByMeetingId(meeting.id)
        },
        chief: async (meeting) =>{
            return MeetingQueries.getChiefByMeetingId(meeting.id)
        },
        messages: async (meeting) => {
            return MeetingQueries.getAllMeetingMessages(meeting.id)
        }
    },
    MeetingMessage:{
        author: async (msg) => {
            return UserQueries.getUserById(msg.author)
        }
    }
    
}
module.exports = {MeetingResolvers}