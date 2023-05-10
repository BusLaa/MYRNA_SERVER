const { Sequelize, DataTypes } = require('sequelize');

const defineData = async (seq) => {
    const User = seq.define('User',{
        id:{
            type : DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        email :{
            type : DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
                notNull: true,
                isTooLong(value){
                    if (typeof value === 'string' && value.length > 50){
                        throw new Error("Email is too long")
                    }
                }
            }
        },
        hashedPassword :{
            type : DataTypes.STRING(32).BINARY,
            allowNull: false
        },
        salt :{
            type : DataTypes.STRING(32).BINARY,
            allowNull: false
        },
        firstName :{
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isLongEnough(value){
                    if (typeof value === 'string' && value.length < 2){
                        throw new Error("first name is too short")
                    }
                }
            }
        },
        lastName :{
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isLongEnough(value){
                    if (typeof value === 'string' && value.length < 2){
                        throw new Error("last name is too short")
                    }
                }
            }
        },
        location :{
            type : DataTypes.STRING
        },
        birthday:{
            type: DataTypes.DATE
        },
        // avatar: {
        //     type: DataTypes.INTEGER,
        //     defaultValue: 5
        // }
    })

    // const Subscription = seq.define('Subscription', {
    //     userId: {
    //         type: DataTypes.INTEGER,
    //         primaryKey: true,
    //         references: {
    //             model: seq.models.User,
    //             key: 'id'
    //         }
    //     },
    //     subscribedId: {
    //         type: DataTypes.INTEGER,
    //         primaryKey: true,
    //         references: {
    //             model: seq.models.User,
    //             key: 'id'
    //         }
    //     }
    // })

    //const Subscription = seq.define('UserSubscription', {})

    // User.associate = (models) => {
    //     models.User.belongsToMany(models.User, {through: 'UserSubscription' , foreignKey: 'userId', otherKey: 'subscribedId'})
    //   };

    User.belongsToMany(User, {as: 'Subscribed', through: 'UserSubscription', foreignKey: "subscribedId"})
    User.belongsToMany(User, {as: 'Subscriptions', through: 'UserSubscription', foreignKey: "userId"})
    


    const Post = seq.define('Post', {
        header:{
            type: DataTypes.TEXT,
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        likes:{
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    })

    User.hasMany(Post, {foreignKey: 'Author', as: 'Posts'})
    Post.belongsTo(User, {foreignKey: 'Author'})
    

    Post.belongsToMany(User, {as: 'UserLiked', through: 'UserLikes', foreignKey: 'PostId'})
    User.belongsToMany(Post, {as: 'PostLikes', through: 'UserLikes', foreignKey: 'UserId'})

    seq.models.UserLikes.afterDestroy(async (userLikes, options) =>{
        const post = await Post.findOne({where : {id : userLikes.PostId}});
        post.likes = post.likes - 1;
        post.save() 
    })

    seq.models.UserLikes.afterCreate(async (userLikes, options) =>{
        const post = await Post.findOne({where : {id : userLikes.PostId}});
        post.likes = post.likes + 1;
        post.save() 
    })

    const Comment = seq.define('Comment', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        content:{
            type: DataTypes.TEXT
        },
        deleted:{
            type: DataTypes.BOOLEAN
        }
    })

    User.hasMany(Comment, {foreignKey: 'AuthorId', as: 'Comments'})
    Comment.belongsTo(User, {foreignKey: 'AuthorId'})
    
    Post.hasMany(Comment, {as: 'Comments'})
    Comment.belongsTo(Post, {foreignKey: 'PostId'})
    

    const Role = seq.define('Role', {
        id: {
            type : DataTypes.INTEGER,
            primaryKey : true,
            autoIncrement: true
        },
        name: {
            type : DataTypes.STRING
        }
    })

    User.belongsToMany(Role, {as: 'Roles', through: 'UserRoles'})
    //Role.belongsToMany(User, {as: 'RoleHolders', through: 'UserRoles'})

    //seq.models.Subscription.create({userId : 10, subscribedId: 12})


    const MeetingType = seq.define('MeetingType', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type : DataTypes.STRING,
            allowNull: false
        }
    })

    const Meeting  = seq.define('Meeting', {
        id :{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type : DataTypes.STRING,
            allowNull: false
        },
        date: {
            type: DataTypes.DATE,

        },
        typeId: {
            type: DataTypes.INTEGER,
            //defaultValue: "upcoming"
        },
    })

    //MeetingType.hasOne(Meeting)
    Meeting.belongsTo(MeetingType, {foreignKey: 'typeId'});

    const userMeeting = seq.define('UserMeeting',{
        important:{
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    })

    Meeting.belongsToMany(User, {through: userMeeting});
    User.belongsToMany(Meeting, {through: userMeeting});

    

    Meeting.belongsTo(User, {foreignKey: "creator"})
    Meeting.belongsTo(User, {foreignKey: "chief"})

    const meetingMsg = seq.define('MeetingMsg',{
        id :{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING
        }
    })

    meetingMsg.belongsTo(User, {foreignKey: 'authorId'})
    meetingMsg.belongsTo(Meeting, {foreignKey: 'meetingId'})
    meetingMsg.belongsTo(meetingMsg, {foreignKey : 'referenceMsgId'})



    

    console.log(seq.models.User)

    const Location = seq.define('location', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        latitude: {
            type: DataTypes.DECIMAL(12,8)
        },
        longitude: {
            type: DataTypes.DECIMAL(12,8)
        },
        country:{
            type: DataTypes.STRING,
        },
        city:{
            type: DataTypes.STRING
        },
        postalCode: {
            type: DataTypes.STRING
        },
        details:{
            type: DataTypes.STRING
        }
    })

    const Place = seq.define('Place', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name :{
            type: DataTypes.STRING,
        },
        paradigm :{
            type: DataTypes.STRING,
        },
        rating:{
            type: DataTypes.DECIMAL(3,2),
            defaultValue: 0
        }
    })

    Place.belongsTo(Location, {foreignKey: 'locationId'})

    const Image = seq.define('image', {
        id :{
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        path: {
            type: DataTypes.STRING
        }
    })

    //Place.belongsToMany(Meeting, {through: 'PlaceMeetings', as: 'Meetings'})
    Meeting.belongsTo(Place, {foreignKey: "placeId", as: 'place'}) 

    

    
    

    // User.hasMany(Comment, {foreignKey: 'AuthorId', as: 'Comments'})
    // Comment.belongsTo(User, {foreignKey: 'AuthorId'})

    const Rating = seq.define('rating', {
        rating: {
            type: DataTypes.DECIMAL(3,2)
        }
    })

    Rating.belongsTo(Place, {foreignKey: 'PlaceId'})
    Rating.belongsTo(User, {foreignKey: 'UserId'})

    const Conversation = seq.define('Conversations',{
        id :{
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        expandable:{
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        idea: {
            type: DataTypes.STRING(160)
        },

    })

    Conversation.belongsToMany(User, {as: 'Users', through: 'UserConversations', foreignKey: 'ConversationId'})
    User.belongsToMany(Conversation, {as: 'Conversations', through: 'UserConversations', foreignKey: 'UserId'})

    const ConversationMessage = seq.define('ConversationMsg',{
        id :{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING
        }
    })

    ConversationMessage.belongsTo(User, {foreignKey: 'authorId'})
    ConversationMessage.belongsTo(Conversation, {foreignKey: 'conversationId'})
    ConversationMessage.belongsTo(ConversationMessage, {foreignKey : 'referenceMsgId'})

    const CornerPlaces = seq.define('CornerPlace', {
        dateAdded :{
            type : DataTypes.DATE
        }
    })

    CornerPlaces.belongsTo(User, {foreignKey: 'userId', as : 'user'})
    //User.belongsTo(CornerPlaces, { as : 'cornerPlaces'})

    CornerPlaces.belongsTo(Place, {foreignKey: 'placeId', as : 'place'})
    //Place.belongsTo(CornerPlaces, { as : 'cornerPlace'})

    const CornerPost = seq.define('CornerPost', {
        dateAdded :{
            type : DataTypes.DATE
        }
    })

    CornerPost.belongsTo(User, {foreignKey: 'userId', as : 'user'})
    //User.belongsTo(CornerPost, { as : 'cornerPost'})

    CornerPost.belongsTo(Post, {foreignKey: 'postId', as : 'post'})
    //Post.belongsTo(CornerPost, { as : 'corner'})




    /*
    
    ///////////////////////////////////////////////////Everything that has to do with images
    
    */
    Meeting.belongsTo(Image, {foreignKey: 'imageId', as :'image'});
    //Image.belongsToMany(Meeting, {through: 'MeetingImgs'}); //Meeting Image

    User.belongsToMany(Image, {through: 'UserImgs', as : "Images"}); //user images
    Image.belongsToMany(User, {through: 'UserImgs'});

    User.belongsTo(Image, {foreignKey: 'avatarId', as : "avatar"}) //avatar
    //Image.belongsTo(User, {foreignKey : 'avatar'})

    Post.belongsToMany(Image, {through: 'PostImgs', as: 'images'}) // post images
    Image.belongsToMany(Post, {through: 'PostImgs'})


    Conversation.belongsTo(Image, {foreignKey: 'imageId', as : 'Image'})
    //Image.belongsTo(ConversationMessage, {as : 'Posts'})
    ConversationMessage.belongsTo(Image, {foreignKey: 'imageId', as : 'Image'}) //conversationMessage image

    meetingMsg.belongsTo(Image, {foreignKey: 'imageId', as : 'Image'})

    Place.belongsToMany(Image, {through : 'PlaceImgs', as : 'images'})
    Image.belongsTo(Place, {through : 'PlaceImgs'})

    /*
    
    ///////////////////////////////////////////////////
    
    */


    



}

module.exports = {defineData}