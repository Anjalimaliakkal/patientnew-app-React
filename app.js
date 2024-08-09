const express = require("express")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const cors = require("cors")
const jwt = require('jsonwebtoken');
const loginModel = require("./models/admin")
const doctorModel = require("./models/doctor")
const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect("mongodb+srv://anjali2003:anjali2003@cluster0.wy6js.mongodb.net/patientnewdb?retryWrites=true&w=majority&appName=Cluster0")

app.get("/test,", (req, res) => {
    res.json({ "status": "success" })
})

app.post("/adminSignup", (req, res) => {
    let input = req.body
    let hashedpassword = bcrypt.hashSync(input.password, 10)
    //console.log(hashedpassword)
    input.password = hashedpassword
    console.log(input)
    let result = new loginModel(input)
    result.save()
    res.json({ "status": "success" })

})

app.post("/adminSignin", (req, res) => {
    let input = req.body
    let result = loginModel.find({ username: input.username }).then(
        (response) => {
            if (response.length > 0) {
                const validator = bcrypt.compareSync(input.password, response[0].password)
                if (validator) {
                    jwt.sign({ email: input.username }, "patientApp", { expiresIn: "1d" },
                        (error, token) => {
                            if (error) {
                                res.json({"status":"token creation failed"})
                            } else {
                                res.json({ "status": "success", "token": token })
                            }
                        })
                } else {
                    res.json({ "status": "wrong password" })
                }
            } else {
                res.json({ "status": "username doesn't exist" })
            }
        }
    ).catch()
})

app.post("/addDoctor", (req, res) => {
    let input = req.body
    let token=req.headers.token
    jwt.verify(token,"patientApp",(error,decoded)=>{
        if (decoded && decoded.email) {
            let result=new doctorModel(input)
            result.save()
            res.json({ "status": "success" })
        } else {
            res.json({ "status": "invalid authentication" })
        }
    })
})

app.listen(8080, () => {
    console.log("server started")
})