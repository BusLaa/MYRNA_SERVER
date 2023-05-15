const passwordGenerator = require('../../tools/PasswordGeneratorTool')
const {verify, sign} = require ('jsonwebtoken');
const { Where } = require('sequelize/lib/utils');
const { where } = require('sequelize/lib/sequelize');
const { Op } = require("sequelize");

const {isRolesInUser} = require('../../tools/FindUserRolesTool')

const sequelize = require("../../connector").sequelize;
const models = sequelize.models;


const getUserRoles = async (userId ) =>{
    const resp = await models.User.findOne({where: {id: userId}, include: 'Roles'}).then((resp) => resp.Roles)
    return resp
}

const UserResolvers = { 
    Query: { 
        // me: async (_,__, ctx) => {

        // }
        getAllUsers: async (_,__, ctx) => {
            try{
                const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;
                if (!isRolesInUser(await getUserRoles(user.id), ["ADMIN"])) throw Error("You do not have rights")
            } catch {
                throw Error("You do not have rights")   
            }
            
            
            return await models.User.findAll({})

        },
        getUserById: async (_, { id }, ctx) => { 
            // const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;
            // // if (user.id !== id && !isRolesInUser(await getUserRoles(user.id), ["ADMIN"])) {
            // //     throw Error("You do not have access to this information");
            // // }

            let data = await models.User.findOne({where: {id : id}});

            if (!data){
                throw Error("No such user")
            }

            return data;
        },
        getUsersByName: async (_, {search, includeYourself, excludeConversation, excludeMeeting} ) =>{
            if (search.trim() == "") return [];
            const where = []

            

            const concated = sequelize.fn('CONCAT', sequelize.col("firstName"),sequelize.col("lastName"),sequelize.col("email"));
            const searchQuery = {[Op.like] : '%'+search.trim().toLowerCase()+'%'}
            where.push(sequelize.where(concated, searchQuery))


            let include = ""
            if (excludeMeeting){
                where.push({[Op.not] : sequelize.literal (`Meetings.id <> ${excludeMeeting} OR Meetings.id IS NULL`)})
                include = "Meetings"

            }

            if (excludeConversation){
                where.push({[Op.not] : sequelize.literal (`Conversations.id <> ${excludeConversation} OR Conversations.id IS NULL`)})
                include = "Conversations"

            }


            const criteria = {
                where: where,
                include: include
            }
            console.log(JSON.stringify(criteria))
            
            return models.User.findAll(criteria)
        }
            
    },
    Mutation: {
        signup: async (_,{email, firstName, lastName,password, locationId, birthday, imageId}) => {


            
            const User = models.User;
            const Role = models.Role;
            const UserRoles = models.UserRoles;

            if (password.length <= 8){
                throw Error('Password too short')
            }
            
            const res = await User.findOne({where: {email: email}})

            if (res !== null) throw Error("This email already exists");

            let [hashed_password, salt] = await passwordGenerator.generateHashedPasswordAndSalt(password);

            const roleUser = await Role.findOne({where: {name : "USER"}});
            if (roleUser === null) throw Error("Role 'USER' is not defined")

            const createdUser = await sequelize.transaction(async (t) =>{
                const user = await User.create({
                    email: email,
                    hashedPassword: hashed_password,
                    salt: salt,
                    firstName: firstName,
                    lastName: lastName,
                    location: locationId,
                    birthday: birthday,
                    imageId: imageId
                }, {transaction: t});

                if (user === null) throw Error("User has not been created");

                const createdUserRole = await UserRoles.create({
                    UserId : user.id ,
                    RoleId : roleUser.id
                }, {transaction: t})

                if (createdUserRole === null) throw Error("UserRole has not been created");

                return user;
            })

            const token = sign({"user": createdUser}, process.env.SECRET_WORD)
            const auth = {token: token, user: createdUser }
            return auth
            
        },
        signin: async (_, { email, password }) => { 

            const User = models.User;
            
            let user = await User.findOne({where: {email : email}});


            if (!user ) throw Error('Wrong email or password');
            if (user.length == 0) throw Error('Za rossiu');


            if ( !passwordGenerator.validatePassword(password, user.salt, user.hashedPassword) ) 
                throw Error('wrong email or password');


            user.roles = user.Roles
            const token = sign({user: user}, process.env.SECRET_WORD)

            const auth = {token: token, user: user }
            return auth
        },
        changeUser: async(_, {userId, email, password,  firstName, lastName, birthday, location, imageId}, ctx) =>{
            const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;
            if (!isRolesInUser(await getUserRoles(user.id), ["ADMIN"]) && user.id !== userId ) throw Error("You do not have rights   ")

            let stringKey, salt;
            if (password) {
                [stringKey, salt] = await passwordGenerator.generateHashedPasswordAndSalt(password);
            }
            
            const updatedUser = {
                email: email,
                hashed_password: stringKey,
                salt: salt,
                firstName: firstName,
                lastName: lastName,
                birthday: birthday,
                location: location ,
                avatarId: imageId
            }
            
            await models.User.update(updatedUser, {where : {id : userId}})

            return await models.User.findOne({where : {id : userId}})


        },
        changeUserRoles: async(_, { id, roles }, ctx) => {

            const UserRoles = models.UserRoles;
            const Role = models.Role;

            const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;
            if (!isRolesInUser(await getUserRoles(user.id), ["ADMIN"])) throw Error("You do not have rights")

            await sequelize.transaction(async (t) =>{
                await UserRoles.destroy({
                    where: {
                        userId: id
                    }
                }, {transaction: t})
                
                for (i of roles){
                    await UserRoles.create({
                        UserId : id ,
                        RoleId : i
                    }, {transaction: t})
                }
            })
            

            return {id: id}
        },
        addNewSubscription: async (_, {userId, subscribedId}, ctx) =>{
            

            const UserSubscription = models.UserSubscription;
            const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;
            if (!isRolesInUser(await getUserRoles(user.id), ["ADMIN"]) && user.id !== userId ) throw Error("You do not have rights")

            return sequelize.transaction(async (t) =>{
                const data = await models.UserSubscription.findOne({where: { userId: userId, subscribedId: subscribedId }})

                if (data === null){
                    const ul = await models.UserSubscription.create({
                        userId: userId,
                        subscribedId: subscribedId
                    })
                    return true
                } else {
                    await data.destroy();
                    return false
                }
            })
        }

        
    },
    User: {
        id: async (user) =>{
            return user.id
        },
        email: async  (user) => {
            return user.email || (await models.User.findOne({where: {id: user.id}})).email
        },
        firstName: async  (user) => {
            return user.firstName || (await models.User.findOne({where: {id: user.id}})).firstName
        },
        lastName: async  (user) => {
            return user.lastName || (await models.User.findOne({where: {id: user.id}})).lastName
        },
        subscriptions: async  (user) =>{
            return (await models.User.findOne({where: {id: user.id}, include: 'Subscriptions'})).subscriptions
        },
        subscribed: async (user) => {
            return (await models.User.findOne({where: {id: user.id}, include: 'subscribed'})).subscribed
        },
        posts: async  (user) => {
            return (await models.User.findOne(
                {
                    
                    include: {
                        model: models.Post, 
                        as : "Posts",
                        where: {deleted: false}},
                     order: [
                        [{model: models.Post, as: 'Posts'}, "id", 'DESC']
                    ],
                    where: {id: user.id}
                })).Posts
        },
        comments: async  (user) => {
            return (await models.User.findOne({where: {id: user.id}, include: 'Comments'})).Comments
        },
        roles: async (user) => {
            return models.User.findOne({where: {id: user.id}, include: 'Roles'})
            .then((res) => 
            res.Roles.map((a) => a.name
            ));
            
        },
        meetings: async (user) => {
            return (await models.User.findOne({where: {id: user.id}, include: 'Meetings'})).Meetings
        },
        likedPosts: async (user) => {
            return (await models.User.findOne({where: {id: user.id}, include: 'PostLikes'})).PostLikes
        },
        location: async (user) =>{
            //return await models.User.findOne({where: {id: user.id}, include: 'userLikes'}).userLikes
            return (await models.Location.findOne({where: {id: user.location}}))
        },
        avatar: async (user) =>{
            //return await models.User.findOne({where: {id: user.id}, include: 'userLikes'}).userLikes
            return (await models.User.findOne({where: {id: user.id}, include : 'avatar'}) ).avatar
        },
        birthday: async(user)=>{
            const bd = (await models.User.findOne({where: {id: user.id}})).birthday
           
            if ( bd.toString() === "Invalid Date"){
                return null
            }
            return bd
        },
        conversations: async (user) => {
            return (await models.User.findOne({where: {id: user.id}, include: 'Conversations'})).Conversations
        },
        images: async (user) =>{
            return (await models.User.findOne({where: {id: user.id}, include: 'images'})).Images
        },
        corner: async(user) =>{
            const corner = {posts : [], places: []};
            corner.posts = (await models.CornerPost.findAll({where: {userId : user.id}, include: 'post'})).map(a => a.post);
            corner.places =  (await models.CornerPlace.findAll({where: {userId : user.id}, include: 'place'})).map(a => a.place);
            return corner
        },
        placeSubscriptions: async (user) =>{
            return (await models.User.findOne({where: {id: user.id}, include: 'Places'})).Places
        }
    },
    
}



module.exports = { 
    UserResolvers
}