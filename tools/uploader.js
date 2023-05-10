const express = require('express')
const crypto = require('crypto');
const {verify, sign} = require ('jsonwebtoken');

const multer = require('multer')

const sequelize = require('../connector').sequelize

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/')
    },
    filename: async function (req, file, cb) {

      console.log(typeof file.originalname)
        const filename = crypto.randomBytes(16).toString('hex') + file.originalname.replace(/ /g, '')
        const created = await sequelize.models.Image.create({
            path: filename
        })

        req.body.addedFileName = created;
        
        cb(null, filename)
    }
  })

const upload = multer({storage: storage})

const router = express.Router();

router.post('/upload', upload.single('image'),  (req, res) =>{
  console.log(req.headers)
    try{
      //console.log(process.env.SECRET_WORD)
      //console.log(req.headers['verify-token']);
      const user = verify(req.headers['verify-token'], process.env.SECRET_WORD).user;
    } catch (err) {
      throw Error(err)
    }
    
    //console.log(req.body.addedFileName)
    res.send(req.body.addedFileName)
})

module.exports = router