const { gql } = require("apollo-server-express");
const PostTypes = gql`
    type Post {
        id: Int!
        author: User!
        header: String!
        content: String!
        likes: Int
        comments: [Comment]
        deleted: Boolean!
    }
    type Comment {
        id: Int!
        post: Post!
        author: User
        content: String!
    }
    type Query{
        getPostById(id: Int!): Post
        getAllPosts: [Post]
        getAllUserPostById(id: Int!): [Post]
        getAllSubscribedPosts (id: Int!): [Post] 
        isPostLikedByUser(post_id: Int!, user_id: Int!): Boolean
    }
    type Mutation{
        addNewPost(userId: Int!, header: String!, content: String!): Post
        addNewComment(userId: Int!, postId: Int!, content: String!): Comment
        likePost(userId: Int!,postId: Int! ): Boolean
        deletePost(post_id: Int!): Boolean
        deleteComment(comment_id: Int!):Boolean
        
    }
`
module.exports = { 
    PostTypes
}