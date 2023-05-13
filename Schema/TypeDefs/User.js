const { gql } = require("apollo-server-express");

const UserTypes = gql`
    type Tag { 
        id: Int
        name: String
    }
    type User {
        id: Int!
        email: String! 
        firstName: String!
        lastName: String!
        birthday: String
        location: Location
        avatar: Image,
        subscriptions: [User]
        subscribed: [User]
        posts: [Post]
        comments: [Comment]
        roles: [Role],
        meetings: [Meeting],
        likedPosts: [Post],
        conversations: [Conversation],
        images: [Image],
        corner: Corner
    }
    type AuthPayload {
        token: String!
        user: User!
    }

    enum Role{
        USER,
        MANAGER,
        ADMIN
    }
    
    type Query { 
        getAllUsers: [User]
        getUserById(id: Int!): User
        me: User! 
        getUsersByName(search:String, includeYourself: Boolean): [User]

    }
    type Mutation {
        signup(email: String!, password: String!, firstName: String!, lastName: String!, locationId: Int, birthday: String, imageId: Int): AuthPayload
        signin(email: String!, password: String!): AuthPayload

        changeUser(userId: Int!,email: String, password: String, , firstName: String, lastName: String, birthday: String, location: Int, imageId: Int): User

        changeUserRoles(id: Int!, roles: [Int]!): User
        addNewSubscription(userId: Int!, subscribedId: Int!) : Boolean

        
    }
    
`

module.exports = { 
    UserTypes
}