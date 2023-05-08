// importing types 
const { UserTypes } = require('./User');
const { PostTypes } = require('./Post');
const { MeetingTypes } = require('./Meeting');
const {LocationTypes} = require(`./Location`)
const {ConversationTypes} = require(`./Conversation`)
const {ImageTypes} = require(`./Image`)
const {CornerTypes} = require(`./Corner`)

module.exports = [ UserTypes , PostTypes, MeetingTypes, LocationTypes, ConversationTypes, ImageTypes, CornerTypes]