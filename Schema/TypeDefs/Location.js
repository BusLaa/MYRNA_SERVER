const { gql } = require("apollo-server-express");

const LocationTypes = gql`
    type Location {
        id: Int!,
        latitude: Float,
        longitude: Float,
        country: String!,
        city: String!,
        postalCode: String!,
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
        getPlacesByName(searchString: String!): [Place]
    }
    type Mutation {
        createLocation(longitude: Float, latitude: Float, country: String! ,city: String!, postalCode: String!, details: String): Location!
        deleteLocation(locationId: Int!): Boolean!
    }
    
`

module.exports = {LocationTypes}