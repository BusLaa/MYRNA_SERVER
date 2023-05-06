const express = require('express')
const crypto = require('crypto');

const multer = require('multer')

const sequelize = require('../connector').sequelize

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/')
    },
    filename: async function (req, file, cb) {

        const filename = crypto.randomBytes(16).toString('hex') + file.originalname
        const created = await sequelize.models.image.create({
            path: filename
        })

        req.body.addedFileName = created;
        
        cb(null, filename)
    }
  })

const upload = multer({storage: storage})

const router = express.Router();

router.post('/upload', upload.single('image'),  (req, res) =>{
    console.log(req.body.addedFileName)
    res.send(req.body.addedFileName)
})

module.exports = router