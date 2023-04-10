const LocationQueries = require('../../queries/LocationQueries');

const sequelize = require("../../connector").sequelize;
const models = sequelize.models;

const LocationResolvers = {
    Query: {
        getAllPlaces: async () =>{
            return models.location.findAll();
        },
        getPlaceById: async (_, {place_id}) =>{
            return LocationQueries.getLocationByPlaceId(place_id)
        }
    },
    Mutation:{
        createLocation: async (_, {longitude, latitude, country ,city, postalCode, details}) =>{
            await LocationQueries.createLocation(longitude, latitude, country, city, postalCode, details);
            return await LocationQueries.getLastLocation()
        },
        deleteLocation: async (_, {locationId}) =>{
            LocationQueries.deleteLocation(locationId)
        }
    },
    Place: {
        location: (place) => {
            return LocationQueries.getLocationByPlaceId(place.id)
        }
    }

}
module.exports = {LocationResolvers}