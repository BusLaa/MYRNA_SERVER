const { gql } = require("apollo-server-express");

const CornerTypes = gql`
    type Corner {
        posts: [Post]
        places: [Place]
    }
    type Mutation {
        addPostToCorner(postId: Int!, userId: Int!): Boolean!
        addPlaceToCorner(postId: Int!, userId: Int!): Boolean!
    }
`

module.exports = {CornerTypes}