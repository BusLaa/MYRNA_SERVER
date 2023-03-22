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
            allowNull: false
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

    const Subsription = seq.define('Subscription', {
        userId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        subscribedId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        }
    })

    Subsription.hasOne(User, {
        foreignKey: 'userId'
    });
    Subsription.hasOne(User, {
        foreignKey: 'subscribedId'
    });

}

module.exports = {defineData}