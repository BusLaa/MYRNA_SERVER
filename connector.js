var mysql = require('mysql2/promise');
require('dotenv').config()

const Sequelize = require("sequelize");
const defineData = require("./dbDefenitions").defineData;

const pool = mysql.createPool({
    host: process.env.DB_host, 
    user: process.env.DB_user,
    password: process.env.DB_password,
    database: process.env.DB_database,
    connectionLimit: 10,
    //port: process.env.DB_port
  });



const sequelize = new Sequelize(
  process.env.DB_database,
  process.env.DB_user,
  process.env.DB_password,
  {
    host: process.env.DB_host,
    dialect: 'mysql'
  }
);

sequelize.authenticate().then(() => {
  console.log('Connection has been established successfully.');
}).catch((error) => {
  throw Error( error)
}).then(() =>{
  defineData(sequelize)
}).then(() =>{
  sequelize.sync({ alter: true});
  console.log("All models were synchronized successfully.");
});


module.exports = {pool, sequelize} 

