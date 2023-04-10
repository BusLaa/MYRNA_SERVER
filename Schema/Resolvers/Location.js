const LocationQueries = require('../../queries/LocationQueries');

const sequelize = require("../../connector").sequelize;
const models = sequelize.models;

const LocationResolvers = {
    Query: {
        getAllPlaces: async () =>{
            return models.Place.findAll();
        },
        getPlaceById: async (_, {placeId}) =>{
            return models.Place.findOne({where: {id: placeId}})
        }
    },
    Mutation:{
        createLocation: async (_, {longitude, latitude, country ,city, postalCode, details}) =>{
            return await models.location.create({
                longitude: longitude,
                latitude: latitude,
                country: country,
                city: city,
                postalCode: postalCode,
                details: details
            })
            //return await LocationQueries.getLastLocation()
        },
        deleteLocation: async (_, {locationId}) =>{
            await models.location.destroy({
                id: locationId
            })
        }
    },
    Place: {
        location: (place) => {
            return models.location.findOne({where: {id: place.locationId}})
        }
    }

}
module.exports = {LocationResolvers}