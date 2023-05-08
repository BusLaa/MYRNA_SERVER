const { gql } = require("apollo-server-express");
const PostTypes = gql`
    type Post {
        id: Int!
        author: User!
        header: String!
        content: String!
        likes: Int
        comments: [Comment]
        deleted: Boolean!,
        images: [Image],
        isLiked: Boolean,
        isCornered: Boolean

    }
    type Comment {
        id: Int!
        post: Post!
        author: User
        content: String!,
        image: Image
    }
    type Query{
        getPostById(id: Int!): Post
        getAllPosts: [Post]
        getAllUserPostById(id: Int!): [Post]
        getAllSubscribedPosts (id: Int!): [Post] 
        isPostLikedByUser(postId: Int!, userId: Int!): Boolean
    }
    type Mutation{
        addNewPost(userId: Int!, header: String!, content: String!): Post
        addNewComment(userId: Int!, postId: Int!, content: String!): Comment
        likePost(userId: Int!,postId: Int! ): Boolean
        deletePost(postId: Int!): Boolean
        deleteComment(commentId: Int!):Boolean
        addImageToPost(postId: Int!,imageId: Int!):Boolean
        
    }
`
module.exports = { 
    PostTypes
}