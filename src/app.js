const express = require('express')
const aws = require('aws-sdk')
const multerS3 = require('multer-s3')
const bodyParser = require('body-parser')
const path = require('path')
const cors = require('cors')
const multer = require('multer')
const app = express()
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient;
const jwt = require('jsonwebtoken')
require('dotenv').config()

app.use(cors())
app.use(express.static('public/uploads'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

const PORT = process.env.PORT || 5000
const DBurl = process.env.DBurl

aws.config.update({
    secretAccessKey: process.env.secretAccessKey,
    accessKeyId: process.env.accessKeyId,
    region: 'ap-south-1'
});

const s3 = new aws.S3();
const awsStorage = multerS3({
    s3: s3,
    bucket: 'dic-app',
    key: function(req, file, cb) {
        var ext = path.extname(file.originalname)
        cb(null, req.query.imgID + ext);
    }
});

const upload = multer({
    storage: awsStorage,
    limits: { fileSize: 5000000 },
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
});

const checkFileType = (file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
  
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb("Error: Images Only!");
    }
};

app.get('/', (req, res) => {
    res.send({ message: "APIEndpoint up and running" }).status(200)
})

app.get('/admin_login', (req, res) => {
    
    MongoClient.connect(DBurl, async (err, client) => {
        if(err)
            res.send({ error: 'Database Connection: Seems like something went wrong!!' })
        else {
            const db = client.db('dic-app-database')
            const admin = await db.collection('admin').findOne({ $and: [{username: req.query.username}, {password: req.query.password}] })
            client.close()
            if(admin) {
                jwt.sign({admin}, 'sushh', (err, token) => {
                    res.status(200).send({token})
                })
            } else
                res.status(400).send({ error: err.message})
        }
    })
})

app.get('/trainee_profile_data', (req, res) => {
    MongoClient.connect(DBurl, (err, client) => {
        if(err)
            res.send({ error: 'Database Connection: Seems like something went wrong!!' })
        else {
            const db = client.db('dic-app-database')
            db.collection('users_form_data').find().toArray((err, items) => {
                if(err)
                    res.status(400).send({ error: err.message })
                else
                    res.status(200).send({ items })
            })
        }
    })
})

app.post('/upload_file', upload.single('image'), (req, res) => {
    
    console.log("hi")
    res.send("SUCCESS")
    
})

app.use('/submit_profile', (req, res) => {

    if(req.body.name) {
        MongoClient.connect(DBurl, (err, client) => {
            if(err)
                res.send({ error: 'Database Connection: Seems like something went wrong!!' })
            else {
                const db = client.db('dic-app-database')
                db.collection('users_form_data').insertOne(req.body)
                client.close()
                res.send({ success: 'Form Data: Success!!' })
            }
        })
    } else {
        res.json({ error: 'Form Values Required !! None given !!' })
    }
})

app.listen(PORT, () => {
    console.log('ON PORT ', PORT)
})