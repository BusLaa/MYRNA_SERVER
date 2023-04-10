const LocationQueries = require('../../queries/LocationQueries');

const sequelize = require("../../connector").sequelize;
const models = sequelize.models;

const isRolesInUser = (userRoles, roles) => {
    userRoles =  userRoles.map ((role) => role.name)
    for (let role of roles){
        if (userRoles.indexOf(role) === -1){return false}
    }
    return true
}
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
        createLocation: async (_, {longitude, latitude, country ,city, postal_code, details}) =>{
            await LocationQueries.createLocation(longitude, latitude, country, city, postal_code, details);
            return await LocationQueries.getLastLocation()
        },
        deleteLocation: async (_, {location_id}) =>{
            LocationQueries.deleteLocation(location_id)
        }
    },
    Place: {
        location: (place) => {
            return LocationQueries.getLocationByPlaceId(place.id)
        }
    }

}
module.exports = {LocationResolvers}