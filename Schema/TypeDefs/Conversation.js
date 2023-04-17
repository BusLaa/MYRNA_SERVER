const { gql } = require("apollo-server-express");

const ConversationTypes = gql`
    type Conversation {
        id: Int!,
        expandable: Boolean!,
        members: [User]!,
        name: String!,
        idea: String!,
        messages: [ConversationMessage]
    }
    type ConversationMessage {
        id: Int!,
        conversation: Conversation!,
        reference: ConversationMessage,
        author: User!,
        content: String!
    }
    type Query {
        getAllConversations: [Conversation]
        getUserConversations(id: Int!): [Conversation] 

    }
    type Mutation {
        createConversation(name: String!, idea: String, expandable: Boolean): Conversation!
        deleteConversation(conversationId: Int!, userId: Int!) : Boolean!
    }
    
`

module.exports = {ConversationTypes}