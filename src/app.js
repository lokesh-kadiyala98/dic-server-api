const express = require('express')
const mysql = require('mysql')
const bodyParser = require('body-parser')
const cors = require('cors')
const multer = require('multer')
const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

const PORT = process.env.PORT || 5000;

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Jyothi123',
    database: 'dic_app'
});

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public')
    },
    filename: function(req, file, cb) {
        cb(null, req.query.name + '-' + file.originalname)
    }
})
const upload = multer({ storage: storage }).single('image')

app.use('/submit_profile', (req, res) => {

    var fileSuccess = false
    var querySuccess = false

    if(req.query.name) {
        upload(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                fileSuccess = false
            } else if (err) {
                fileSuccess = false
            }
            fileSuccess = true
        })

        const query = 'INSERT INTO trainee_profile(name, id_numb, father_husband_name, mother_name, guardian_name, address, grama, grama_panchayat, ' + 
        'taluk, district, mobile, email, alternative_phone, alternative_mobile, age, education_qualification, religion, gender, category, yearly_income) ' + 
        'VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'

        connection.query(query, [req.query.name, 
            req.query.individualIdentityNumber, 
            req.query.fatherOrHusbandName, 
            req.query.mother, 
            req.query.guardianName,
            req.query.address,
            req.query.grama,
            req.query.gramaPanchayat,
            req.query.taluk,
            req.query.district,
            req.query.mobile,
            req.query.emailId,
            req.query.phone,
            req.query.alternativeMobile,
            req.query.age,
            req.query.educationQualification,
            req.query.religion,
            req.query.gender,
            req.query.category,
            req.query.yearlyIncome
        ], (err, rows, fields) => {
            if(err){
                res.json({ success: false })
                res.sendStatus(500)
                return
            }
            res.json({
                file: fileSuccess,
                query: true,
            })
        })
        
    } else {
        res.json({ error: 'API requires form values and file to be uploaded. None given.' })
    }

})

app.listen(PORT, () => {
    console.log('ON PORT ', PORT)
})