const passwordGenerator = require('../../tools/PasswordGeneratorTool')
const {verify, sign} = require ('jsonwebtoken');
const UserQueries = require('../../queries/UserQueries')
const PostQueries = require('../../queries/PostQueries')
const MeetingQueries = require('../../queries/MeetingQueries')
const LocationQueries = require('../../queries/LocationQueries');

const Sequelize = require('sequelize')
const models = require("../../connector").sequelize.models;



const getUserRoles = async (userId ) =>{
    const resp = await models.User.findOne({where: {id: userId}, include: 'Roles'}).then((resp) => resp.Roles)
    return resp
}

const isRolesInUser = (userRoles, roles) => {
    userRoles =  userRoles.map ((role) => role.name)
    console.log(userRoles.indexOf("ADMIN"))
    for (let role of roles){
        if (userRoles.indexOf(role) === -1){return false}
    }
    return true
}

const UserResolvers = { 
    Query: { 
        getAllUsers: async (_,__, ctx) => {
            const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;

            if (!isRolesInUser(await getUserRoles(user.id), ["ADMIN"])) throw Error("You do not have rights (basically woman)")
            

            console.log((await models.User.findOne({where: {id: 1}, include: 'Roles'})).Roles)
            //getUserRoles()
            return await models.User.findAll({})

        },
        getUserById: async (_, { id }, ctx) => { 
            const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;

            let data = await models.User.findOne({where: {id : id}});

            if (!data){
                throw Error("No such user")
            }

            return data;
        },
        getUsersByName: async (_, {search} ) =>{
            if (search.trim() == "") return [];
            const concated = Sequelize.fn('CONCAT', Sequelize.col("firstName"),Sequelize.col("lastName"),Sequelize.col("email"));
            const searchQuery = {[Sequelize.Op.like] : '%'+search.trim().toLowerCase()+'%'}
            const criteria = {
                where: Sequelize.where(concated, searchQuery)
            }
            return models.User.findAll(criteria)
        }
            
    },
    Mutation: {
        signup: async (_,{email, firstName, lastName,password, locationId, birthday}) => {

            const User = models.User;


            if (password.length <= 8){
                throw Error('Password too short')
            }
            
            const res = await User.findOne({where: {email: email}})

            if (res !== null){
                throw Error("This email already exists");
            } 

            let [hashed_password, salt] = await passwordGenerator.generateHashedPasswordAndSalt(password);


            return User.create({
                email: email,
                hashedPassword: hashed_password,
                salt: salt,
                firstName: firstName,
                lastName: lastName,
                location: locationId,
                birthday: birthday
            }).then((user) =>{
                console.log(user)
                const token = sign({"user": user}, process.env.SECRET_WORD)
                const auth = {token: token, user: user }
                return auth

            }).catch((err) =>{
                console.log(err)
            })
            
        },
        signin: async (_, { email, password }) => { 

            const User = models.User;
            
            let user = await User.findOne({where: {email : email}});

            console.log(user)

            if (!user) throw Error('Wrong email or password');
            if (user.length == 0) throw Error('Za rossiu');

            try{
                if ( !passwordGenerator.validatePassword(password, user.salt, user.hashedPassword) ) throw Error('wrong email or password');
            } catch {
                throw Error('Wrong password');
            }


            user.roles = await user.Roles
            const token = sign({user: user}, process.env.SECRET_WORD)

            const auth = {token: token, user: user }
            return auth
        },
        changeUser: async(_, {userId, email, password,  firstName, lastName, birthday, location}, ctx) =>{
            const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;
            if (!isRolesInUser(await getUserRoles(user.id), ["ADMIN"]) && user.id !== user_id ) throw Error("You do not have rights (basically woman)")

            let stringKey, salt;
            if (password) {
                [stringKey, salt] = await passwordGenerator.generateHashedPasswordAndSalt(password);
            }
            const userToUpdate = await models.User.findOne({where : {id: userId}});
            const updated_user = {
                email: email,
                hashed_password: stringKey,
                salt: salt,
                firstName: firstName,
                lastName: lastName,
                birthday: birthday,
                location: location 
            }
            await UserQueries.updateUser(user_id, updated_user)

            return UserQueries.getUserById(user_id)


        },
        changeUserRoles: async(_, { id, roles }, ctx) => {

            const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;
            if (!isRolesInUser(await getUserRoles(user.id), ["ADMIN"])) throw Error("You do not have rights (basically woman)")

            const allRoles = await UserQueries.getAllRoles()
            const userRoles = await UserQueries.getAllUserRoles(id)

            let userRolesArray = []
            for (i of userRoles){
                userRolesArray.push(i.id)
            }
            const toChange = {
                'toDelete': [],
                'toAdd': []
            }
            
            for (i of allRoles){
                if (roles.includes(i.id) && !userRolesArray.includes(i.id)){
                    toChange.toAdd.push(i.id)
                } else if (!roles.includes(i.id) && userRolesArray.includes(i.id)){
                    toChange.toDelete.push(i.id)
                }
            }
            
            for (i of toChange.toAdd){
                try{
                    UserQueries.insertUserRole(id, i)
                } catch (err) {
                    console.log(err)
                }
            }
            for (i of toChange.toDelete){
                try{
                    UserQueries.deleteUserRole(id, i)
                } catch (err) {
                    console.log(err)
                }
            }
            return {id: id}
        },
        addNewSubscription: async (_, {user_id, subscribed_id}, ctx) =>{
            const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;
            if (!isRolesInUser(await getUserRoles(user.id), ["ADMIN"]) && user.id !== user_id ) throw Error("You do not have rights (basically woman)")

            UserQueries.insertSubcription(user_id, subscribed_id);
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
            return (await models.User.findOne({where: {id: user.id}})).firstName
        },
        lastName: async  (user) => {
            return (await models.User.findOne({where: {id: user.id}})).lastName
        },
        subscriptions: async  (user) =>{
            return await models.User.findOne({where: {id: user.id}, include: 'Subscriptions'}).Subscriptions
        },
        subscribed: async (user) => {
            return await models.User.findOne({where: {id: user.id}, include: 'Subscribed'}).Subscribed
        },
        posts: async  (user) => {
            return await models.User.findOne({where: {id: user.id}, include: 'Posts'}).Posts
        },
        comments: async  (user) => {
            return await models.User.findOne({where: {id: user.id}, include: 'Comments'}).Comments
        },
        roles: async (user) => {
            return await models.User.findOne({where: {id: user.id}, include: 'Roles'}).Roles
        },
        meetings: async (user) => {
            return await models.User.findOne({where: {id: user.id}, include: 'Meetings'}).Meetings
        },
        likedPosts: async (user) => {
            return await models.User.findOne({where: {id: user.id}, include: 'userLikes'}).userLikes
        },
        location: async (user) =>{
            //return await models.User.findOne({where: {id: user.id}, include: 'userLikes'}).userLikes
            return "There is a bug that I am currently too lazy to fix"
        }
    },
    
}



module.exports = { 
    UserResolvers
}