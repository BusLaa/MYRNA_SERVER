const { gql } = require("apollo-server-express");

const ConversationTypes = gql`
    type Conversation {
        id: Int!,
        expandable: Boolean!,
        users: [User]!,
        name: String!,
        idea: String!
    }
    type ConversationMessage {
        id: Int!,
        conversation: Conversation!,
        reference: ConversationMessage,
        author: User!
    }
    type Query {
        getAllConversations: [Conversation]
        getUserConversations(id: Int!): [Conversation] 

    }
    type Mutation {
        createConversation(name: String!, idea: String, expandable: Boolean): Conversation!

    }
    
`

module.exports = {ConversationTypes}