const { gql } = require("apollo-server-express");

const ConversationTypes = gql`
    type Conversation {
        id: Int!,
        expandable: Boolean!,
        users: [User]!
    }
    type ConversationMessage {
        id: Int!,
        conversation: Conversation!,
        reference: ConversationMessage,
    }
    
`

module.exports = {ConversationTypes}