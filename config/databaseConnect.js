require('dotenv').config(); //Load .env file were mongodb URL is added

const mongoose = require('mongoose')

// MONGODB CONNECTION


const dbConnection = async()=>{
    try{
        const dbURL = process.env.MONGODB_URL
        await 
        mongoose.connect(dbURL);
          console.log('Connected to MongoDB');

    }catch(error){
        console.log('mongodb connection error',error);
    }
}

module.exports = dbConnection 