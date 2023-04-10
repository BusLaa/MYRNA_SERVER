require('dotenv').config()
const Sequelize = require("sequelize");
const defineData = require("./dbDefenitions").defineData;

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
    sequelize.sync({force: true});
    console.log("All models were synchronized successfully.");
  }).then(() =>{
    const Role = sequelize.models.Role
    console.log(sequelize.models)
    setTimeout(()=>{
      Role.findOrCreate({
        where:{
            name: "ADMIN"
        }
      }).then(() =>{
          Role.findOrCreate({
              where:{
                  name: "MANAGER"
              }
          })
      }).then(() =>{
          Role.findOrCreate({
              where:{
                  name: "USER"
              }
          })
      })
    }, 2000)
    
    console.log(sequelize.models)
  });

