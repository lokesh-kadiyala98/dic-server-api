const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const cors = require('cors')
const multer = require('multer')
const app = express()
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient;

app.use(cors())
app.use(express.static('public/uploads'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

const PORT = process.env.PORT || 5000;
const DBurl = 'mongodb+srv://root:root@dic-gkoak.mongodb.net/test?retryWrites=true&w=majority';

app.use('/upload_file', (req, res) => {
    
    const storage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, 'public/uploads')
        },
        filename: function(req, file, cb) {
            var ext = path.extname(file.originalname)
            if(!file.originalname)
                res.send({ error: 'File Upload: Something Went Wrong !!'})
            cb(null, req.query.imgID + ext)
        }
    })
    const upload = multer({ storage: storage }).single('image')

    upload(req, res, (err) => {
        if (err)
            res.send({ error: 'File Upload: Something Went Wrong !!' })
        else if (!req.file)
            res.send({ error: 'File Upload: Image File is Required !!' })
        else
            res.send({ success: 'File Upload: Success !!' })
    })

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