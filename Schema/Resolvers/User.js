const passwordGenerator = require('../../tools/PasswordGeneratorTool')
const {verify, sign} = require ('jsonwebtoken');
const {isRolesInUser} = require('../../tools/FindUserRolesTool');
const UserQueries = require('../../queries/UserQueries')
const PostQueries = require('../../queries/PostQueries')
const MeetingQueries = require('../../queries/MeetingQueries')
const LocationQueries = require('../../queries/LocationQueries');

const {sequelize} = require("../../connector");

const getUserRoles = async (user_id) =>{
    const resp = await UserQueries.getAllUserRoles(user_id)
    const roles = [];
    for (i of resp){
        roles.push (i.name)
    }
    return roles
}

const UserResolvers = { 
    Query: { 
        getAllUsers: async (_,__, ctx) => {
            const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;
            if (!isRolesInUser(await getUserRoles(user.id), ["ADMIN"])) throw Error("You do not have rights (basically woman)")

            return await UserQueries.getAllUsers();

        },
        getUserById: async (_, { id }, ctx) => { 
            const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;

            let data = await UserQueries.getUserById(id)

            if (!data){
                throw Error("No such user")
            }

            return data;
        },
        getUsersByName: async (_, {search} ) =>{
            if (search.trim() == "") return [];
            return UserQueries.getUsersWithSimilarName(search.trim().toLowerCase())
        }
            
    },
    Mutation: {
        signup: async (_,{email, first_name, last_name,password, location_id, birthday}) => {

            const User = sequelize.models.User;


            if (password.length <= 8){
                throw Error('Password too short')
            }
            
            const res = await User.findOne({where: {email: email}})

            if (res !== null){
                throw Error("This email already exists");
            } 

            let [hashed_password, salt] = await passwordGenerator.generateHashedPasswordAndSalt(password);
            //const createdUser = 
            return User.create({
                email: email,
                hashedPassword: hashed_password,
                salt: salt,
                firstName: first_name,
                lastName: last_name,
                location: location_id,
                birthday: birthday
            }).then((user) =>{
                console.log(user)
                const token = sign({"user": user}, process.env.SECRET_WORD)
                const auth = {token: token, user: user }

                return auth

            })
            
        },
        signin: async (_, { email, password }) => { 
            let user = await UserQueries.getUsersByEmail(email);

            if (!user) throw Error('Wrong email or password');
            if (user.length == 0) throw Error('Za rossiu');

            user = user[0]

            try{
                if ( !passwordGenerator.validatePassword(password, user.salt, user.hashed_password) ) throw Error('wrong email or password');
            } catch {
                throw Error('Wrong email or password');
            }


            user.roles = await getUserRoles(user.id)
            const token = sign({user: user}, process.env.SECRET_WORD)

            const auth = {token: token, user: user }
            return auth
        },
        changeUser: async(_, {user_id, email, password,  first_name, last_name, birthday, location}, ctx) =>{
            const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;
            if (!isRolesInUser(await getUserRoles(user.id), ["ADMIN"]) && user.id !== user_id ) throw Error("You do not have rights (basically woman)")

            let stringKey, salt;
            if (password) {
                [stringKey, salt] = await passwordGenerator.generateHashedPasswordAndSalt(password);
            }
            const updated_user = {
                email: email,
                hashed_password: stringKey,
                salt: salt,
                first_name: first_name,
                last_name: last_name,
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
            let user_ret = await UserQueries.getUserById(user.id)

            if (!user_ret){
                throw Error("No such user")
            }

            return user_ret.id;
        },
        email: async  (user) => {
            let user_ret = await UserQueries.getUserById(user.id)

            if (!user_ret){
                throw Error("No such user")
            }

            return user_ret.email;
        },
        first_name: async  (user) => {
            let user_ret = await UserQueries.getUserById(user.id)

            if (!user_ret){
                throw Error("No such user")
            }

            return user_ret.first_name;
        },
        last_name: async  (user) => {
            let user_ret = await UserQueries.getUserById(user.id)

            if (!user_ret){
                throw Error("No such user")
            }

            return user_ret.last_name;
        },
        subscriptions: async  (user) =>{
            return await UserQueries.getAllSubsciptions(user.id)
        },
        subscribed: async (user) => {
            return await UserQueries.getAllSubscribed(user.id);
        },
        posts: async  (user) => {
           return await PostQueries.getAllUserPosts(user.id);
        },
        comments: async  (user) => {
            return await PostQueries.getAllUserComments(user.id)
        },
        roles: async (user) => {
            return await getUserRoles(user.id)
        },
        meetings: async (user) => {
            return MeetingQueries.getAllUserMeetings(user.id)
        },
        likedPosts: async (user) => {
            return PostQueries.getLikedPostByUserId(user.id)
        },
        location: async (user) =>{
            return LocationQueries.getLocationByUserId(user.id)
        }
    },
    
}



module.exports = { 
    UserResolvers
}