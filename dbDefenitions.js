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
        avatar: {
            type: DataTypes.INTEGER,
            defaultValue: 5
        }
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

    Post.belongsTo(User, {foreignKey: 'Author', as: 'UserPosts'})

    Post.belongsToMany(User, {as: 'UserLiked', through: 'UserLikes', foreignKey: 'UserId'})
    User.belongsToMany(Post, {as: 'PostLikes', through: 'UserLikes', foreignKey: 'PostId'})

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

    const meetingMsg = seq.define('meetingMsg',{
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

    Place.belongsToMany(Meeting, {through: 'PlaceMeetings', as: 'Meetings'})
    Meeting.belongsToMany(Place, {through: 'PlaceMeetings', as: 'Places'})

    Meeting.belongsToMany(Image, {through: 'MeetingImgs'});
    Image.belongsToMany(Meeting, {through: 'MeetingImgs'});

    User.belongsToMany(Image, {through: 'UserImgs'});
    Image.belongsToMany(User, {through: 'UserImgs'});

    const Rating = seq.define('rating', {
        rating: {
            type: DataTypes.DECIMAL(3,2)
        }
    })

    Rating.belongsTo(Place, {foreignKey: 'PlaceId'})
    Rating.belongsTo(User, {foreignKey: 'UserId'})

    



}

module.exports = {defineData}