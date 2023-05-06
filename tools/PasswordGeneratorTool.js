const crypto = require('crypto');
const generateHashedPasswordAndSalt = async (passwordString) => {
    let salt = crypto.randomBytes(16).toString('hex')
    key =  crypto.scryptSync(passwordString, salt, 16);
    let hashedPassword = key.toString('hex')
    return [hashedPassword, salt]
};
const validatePassword = (passwordString, salt, trueHashedPassword) =>{
    key =  crypto.scryptSync(passwordString, salt.toString('hex'), 16);
    let hashedPassword = key.toString('hex')
    return (trueHashedPassword.toString('hex') === hashedPassword) 
}
const generateHashedPasswordAndSaltWithoutString = () => {
    let passwordString = crypto.randomBytes(16).toString('hex')
    let salt = crypto.randomBytes(16).toString('hex')
    key =  crypto.scryptSync(passwordString, salt, 16);
    let hashedPassword = key.toString('hex')
    return [hashedPassword, salt, passwordString]
}

module.exports = {generateHashedPasswordAndSalt, validatePassword, generateHashedPasswordAndSaltWithoutString}