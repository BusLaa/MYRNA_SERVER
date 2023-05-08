//importing resolvers 
const { UserResolvers } = require('./User');
const { PostResolvers } = require('./Post');
const {MeetingResolvers} = require('./Meeting');
const {LocationResolvers} = require(`./Location`)
const {ConversationResolvers} = require('./Conversation');


module.exports = [ UserResolvers , PostResolvers, MeetingResolvers, LocationResolvers, ConversationResolvers]