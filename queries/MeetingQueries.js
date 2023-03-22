const {getOne, getMany, insert} = require('../tools/QueryTool')
const {pool} = require("../connector");

const getAllMeetings = () =>{
    return getMany(pool, `SELECT * FROM meetings`)
}
const getAllUserMeetings = (user_id) =>{
    return getMany(pool, `SELECT * FROM meetings WHERE id IN (SELECT meeting_id FROM user_meetings WHERE user_id = ${user_id})`)
}
const createNewMeeting =async (name, date, type,status, creator) =>{
    await insert(pool, `INSERT INTO meetings (name, creator, chief ${date ? ',date ': ''} ${type ? ',type_id ': ''} ${status ? ',status ': ''}) 
    VALUES ('${name}', ${creator},${creator} ${date ? `, '${date}' ` : '' } ${type ? `, ${type} ` : '' } ${status ? `, ${status} ` : '' })`)
}
const addMeetingUser = async (meeting_id, user_id) => {
    await insert(pool, `INSERT INTO user_meetings (meeting_id, user_id ) 
    VALUES (${meeting_id}, ${user_id} )`)
}
const getLastMeeting = async () => {
    return await getOne (pool, `SELECT * FROM meetings WHERE id = (SELECT MAX(id) FROM meetings)`)
}
const getMeetingType = (meeting_id) =>{
    return getOne (pool, `SELECT * FROM meeting_types WHERE id = (SELECT type_id FROM meetings WHERE id = ${meeting_id})`)
}
const getAllMeetingMembers = (meeting_id) =>{
    return getMany (pool, `SELECT * FROM users WHERE id IN (SELECT user_id FROM user_meetings WHERE meeting_id = ${meeting_id})`)
}
const addMeetingMessage = async (meeting_id, author,content, referenceMessageId) =>{
    await insert(pool, `INSERT INTO meeting_msg (meeting_id, author, content) VALUES (${meeting_id},${author},'${content}')`)
}
const deleteMeeting = async (meeting_id) => {
    await insert (pool, `DELETE FROM meetings WHERE id = ${meeting_id}`);
}
const removeMeetingUser = async (meeting_id, user_id)=>{
    await insert(pool, `DELETE FROM user_meetings WHERE meeting_id = ${meeting_id} AND user_id = ${user_id}`)
}
const changeMeeting = async (meeting_id, name, date) => {
    let comma = (name != null && date != null) ? ',' : ''
    await insert(pool, `UPDATE meetings
    SET ${name ? ` name = '${name}'` : '' } ${comma} ${date ? ` date = '${date}'` : '' }
    WHERE id = ${meeting_id}`)
}
const getMeetingById = async (meeting_id) => {
    return getOne(pool, `SELECT * FROM meetings WHERE id = ${meeting_id}`);
}
const getMeetingCreator = async (meeting_id) => {
    return getOne(pool, `SELECT * FROM users WHERE users.id = (SELECT creator FROM meetings WHERE meetings.id = ${meeting_id})`)
}
const getLastMeetingMessage = async () => {
    return await getOne(pool, `SELECT * FROM meeting_msg WHERE meeting_msg.id = (SELECT MAX(id) FROM meeting_msg)`)
}
const updateMeetingChief = async (meeting_id,user_id) =>{
    await insert(pool, `UPDATE meetings SET chief = ${user_id} WHERE meetings.id = ${meeting_id}`)
}
const updateImportantUserMeetings = async (meeting_id, user_id) =>{
    await insert(pool, `UPDATE user_meetings SET important = NOT important WHERE user_id = ${user_id} AND meeting_id = ${meeting_id}`)
}
const getUserMeetingByUserIdAndMeetingId = async (meeting_id, user_id) => {
    return await getOne(pool, `SELECT * FROM user_meetings WHERE user_id = ${user_id} AND meeting_id = ${meeting_id}`) 
}
const getChiefByMeetingId = async (meeting_id) =>{
    return await getOne (pool, `SELECT * FROM users WHERE users.id = (SELECT chief FROM meetings WHERE meetings.id = ${meeting_id})`)
}
const getAllMeetingMessages = async (meeting_id) => {
    return await getMany (pool, `SELECT * FROM meeting_msg WHERE meeting_id = ${meeting_id}`)
}
const getAllMessageCreator = async (message_id) => {
    return await getMany (pool, `SELECT * FROM users WHERE id = (SELECT author FROM meeting_msg WHERE id = ${message_id})`)
}

module.exports = {
    getAllMeetings,
    getAllUserMeetings,
    createNewMeeting,
    getLastMeeting,
    addMeetingUser,
    getMeetingType,
    getAllMeetingMembers,
    addMeetingMessage,
    deleteMeeting,
    removeMeetingUser,
    changeMeeting,
    getMeetingById,
    getMeetingCreator,
    getLastMeetingMessage,
    updateMeetingChief,
    updateImportantUserMeetings,
    getUserMeetingByUserIdAndMeetingId,
    getChiefByMeetingId,
    getAllMeetingMessages
};