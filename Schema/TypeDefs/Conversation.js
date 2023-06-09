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
        content: String!,
        createdAt: String
    }
    type Query {
        getAllConversations: [Conversation]
        getUserConversations(id: Int!): [Conversation] 

    }
    type Mutation {
        createConversation(name: String!, idea: String, expandable: Boolean): Conversation!
        deleteConversation(conversationId: Int!, userId: Int!) : Boolean!

        createConversationMessage(conversationId: Int!,authorId: Int!, referenceId: Int, content: String!) : ConversationMessage!

        deleteConversationMessage(ConversationMessageId: Int!) : Boolean!

        inviteUserToConversation(conversationId: Int!, userId: Int!) :User!
    }
    
`

module.exports = {ConversationTypes}