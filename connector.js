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
    dialect: 'mysql',
    logging: false
  }
);

sequelize.authenticate().then(() => {
  console.log('Connection has been established successfully.');
}).catch((error) => {
  throw Error( error)
}).then(() =>{
  defineData(sequelize)
}).then(() =>{
  sequelize.sync();
  console.log("All models were synchronized successfully.");
}).then(() =>{
  const Role = sequelize.models.Role
  const MeetingTypes = sequelize.models.MeetingType
  const User = sequelize.models.User
  const UserRoles = sequelize.models.UserRoles
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
    }).then(() =>{
      MeetingTypes.findOrCreate({
          where:{
              name: "Hang out"
          }
      })
    }).then(() =>{
      MeetingTypes.findOrCreate({
          where:{
              name: "business"
          }
      })
    }).then(() =>{
      MeetingTypes.findOrCreate({
          where:{
              name: "date"
          }
      })
    }).then(() =>{
      sequelize.transaction(async (t) =>{
        const user = await User.create({
            email: "test@test.com",
            hashedPassword: "ac92231a5a6d116989185448d6ea68c5",
            salt: "34a38aa26c8dfb38b1ad934759683340",
            firstName: "Linus",
            lastName: "Torvalds",
        }, {transaction: t});

        if (user === null) throw Error("User has not been created");

        const createdUserRole = await UserRoles.create({
            UserId : user.id ,
            RoleId : 3
        }, {transaction: t})

        if (createdUserRole === null) throw Error("UserRole has not been created");

        return user;
    })
    })
  }, 2000)

});


module.exports = {pool, sequelize} 

