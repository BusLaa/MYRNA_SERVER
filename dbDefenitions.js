const { Sequelize, DataTypes } = require('sequelize');

const defineData = (seq) => {
    const User = seq.define('User',{
        id:{
            type : DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        email :{
            type : DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        hashedPassword :{
            type : DataTypes.STRING(16).BINARY,
            allowNull: false
        },
        salt :{
            type : DataTypes.STRING(16).BINARY,
            allowNull: false
        },
        firstName :{
            type: DataTypes.STRING,
            allowNull: false
        },
        lastName :{
            type: DataTypes.STRING,
            allowNull: false
        },
        location :{
            type : DataTypes.STRING
        },
        birthday:{
            type: DataTypes.DATE
        },
        avatar: {
            type: DataTypes.INTEGER,
            default: 5
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

    //User.belongsToMany(User, {as: 'Subscribed', through: 'UserSubscription', uniqueKey: "SubscribedId"})
    User.belongsToMany(User, {as: 'Subscriptions', through: 'UserSubscription', uniqueKey: "UserId"})
    


    const Post = seq.define('Post', {
        userId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
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
            default: 0
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            default: false
        }
    })

    Post.belongsTo(User, {foreignKey: 'AuthorId'})

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
    Comment.belongsTo(User, {foreignKey: 'AuthorId'})
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
            status: DataTypes.STRING,
            default: "upcoming"
        },
    })

    //MeetingType.hasOne(Meeting)
    Meeting.belongsTo(MeetingType, {foreignKey: 'typeId'});
    

    Meeting.belongsToMany(User, {through: 'UserMeetings'});
    User.belongsToMany(Meeting, {through: 'UserMeetings'});

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
    meetingMsg.belongsTo(meetingMsg, {foreignKey : 'referenceMsgId'})



    const userLikes = seq.define('userLikes', {})

    userLikes.belongsTo(User, {foreignKey: 'UserId'})
    userLikes.belongsTo(Post, {foreignKey: 'PostId'})

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
            default: 0
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