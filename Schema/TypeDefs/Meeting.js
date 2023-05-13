    const { gql } = require("apollo-server-express");

const MeetingTypes = gql`
    type Meeting {
        id: Int!,
        name: String!,
        date: String,
        type: String!,
        status: String,
        creator: User!,
        chief: User!,
        place: Place!,
        members: [User],
        messages: [MeetingMessage],
        image: Image,
        isImportant: Boolean
    }
    type MeetingMessage {
        id: Int!,
        author: User!,
        referenceMessage: MeetingMessage,
        content: String!,
        createdAt: String
    }
    type MeetingType {
        id: Int!
        name: String!
    }
    type Query {
        getAllMeetings: [Meeting]
        getAllMeetingTypes: [MeetingType]
    }
    type Mutation {
        createNewMeeting(name: String!,date: String, type: Int, creator: Int!, status: String, placeId: Int!): Meeting!
        inviteUserToMeeting(meetingId: Int!, userId: Int!): User
        createMeetingMessage(meetingId: Int!, author: Int!,content: String!, referenceMessageId: Int): MeetingMessage!
        deleteMeeting(meetingId: Int!, userId: Int!) : Boolean!
        changeMeeting(meetingId: Int!, name: String, date: String ): Meeting!
        makeChief(meetingId: Int!, userId: Int!): Boolean!
        makeImportant(meetingId: Int!, userId: Int!): Boolean!

    }
`

module.exports = { 
    MeetingTypes
}