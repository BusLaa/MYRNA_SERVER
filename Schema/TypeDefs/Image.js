const { gql } = require("apollo-server-express");

const ImageTypes = gql`
    type Image {
        id: Int!,
        path: String!
    }
`

module.exports = {ImageTypes}