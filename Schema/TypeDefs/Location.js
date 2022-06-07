const { gql } = require("apollo-server-express");

const LocationTypes = gql`
    type Location {
        id: Int!,
        latitude: Float,
        longitude: Float,
        country: String!,
        city: String!,
        postal_code: String!,
        details: String
    }
    type Place {
        id: Int!,
        name: String!,
        paradigm: String!,
        location: Location!, 
        rating: Float
    }
    type Query{
        getAllPlaces: [Place]
        getPlaceById(place_id: Int!): Place! 
    }
    type Mutation {
        createLocation(longitude: Float, latitude: Float, country: String! ,city: String!, postal_code: String!, details: String): Location!
        deleteLocation(location_id: Int!): Boolean!
    }
    
`

module.exports = {LocationTypes}