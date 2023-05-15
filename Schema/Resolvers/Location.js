const sequelize = require("../../connector").sequelize;
const models = sequelize.models;

const { Op } = require("sequelize");

const LocationResolvers = {
    Query: {
        getAllPlaces: async () =>{
            return models.Place.findAll();
        },
        getPlaceById: async (_, {placeId}) =>{
            return models.Place.findOne({where: {id: placeId}})
        },
        getPlacesByName: async (_, {searchString}) =>{
            const places = models.Place.findAll({
                where: {
                    name : {
                        [Op.like] : '%'+searchString.trim().toLowerCase()+'%'
                    }
                }
            })
            return places
        }
    },
    Mutation:{
        createLocation: async (_, {longitude, latitude, country ,city, postalCode, details}) =>{
            
            const loc = await models.Location.create({
                longitude: longitude,
                latitude: latitude,
                country: country,
                city: city,
                postalCode: postalCode,
                details: details
            })

            return loc
            //return await LocationQueries.getLastLocation()
        },
        deleteLocation: async (_, {locationId}) =>{
            await models.Location.destroy({
                id: locationId
            })
        },
        addNewPlaceSubscription: async (_, {placeId, userId}) =>{

            const existed = await models.UserPlaces.findOne({
                PlaceId: placeId,
                UserId : userId
            })

            if (existed) {
                existed.destroy()
                return false
            }

            await models.UserPlaces.create({
                PlaceId: placeId,
                UserId : userId
            })
            return true


        }
    },
    Place: {
        id: (place) =>{
            return place.id
        },
        location: (place) => {
            return models.Location.findOne({where: {id: place.locationId}})
        },
        images: async (place) =>{
            return (await models.Place.findOne({where :{id: place.id}, include: "images"})).images
        }
    }

}
module.exports = {LocationResolvers}