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
            
            console.log("qwertyuiop")
            const loc = await models.location.create({
                longitude: longitude,
                latitude: latitude,
                country: country,
                city: city,
                postalCode: postalCode,
                details: details
            })

            console.log(loc)

            return loc
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
        },
        images: async (place) =>{
            return (await models.Place.findOne({where :{id: place.id}, include: "images"})).images
        }
    }

}
module.exports = {LocationResolvers}