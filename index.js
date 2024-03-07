require('dotenv').config() //loading env variables from a .env file into process.env
const path = require('path')
const express = require ('express')
const userRoute = require('./route/userRoute')
const adminRoute = require('./route/adminRoute')
const nocache = require("nocache")

const dbConnection = require('./config/databaseConnect')
const session = require('express-session') //simple way to manage user sessions
const app = express()

app.use(express.json()) //parses the JSON data and makes it available in req.body object
app.use(express.urlencoded({extended:true}))  //parse URL-encoded data in the request body, typically used for processing form submissions

// set up the database connection
dbConnection()

// set up the session middleware
app.use(session({
    secret:process.env.SESSIONSECRET,
    resave:false,
    saveUninitialized:true 
}))

// cache controller
app.use(nocache())

// set the view engine as ejs
app.set('view engine','ejs')
app.set('views','./views')

// serve the static folder
app.use(express.static(path.join(__dirname,'public')))
app.use(express.static(path.join(__dirname,'public/assets')))
app.use(express.static(path.join(__dirname,'public/userassets')))

// simple routes
app.use('/admin',adminRoute)
app.use('/',userRoute)


const port = process.env.PORT|| 3000
app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`);
})