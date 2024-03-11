require('dotenv').config(); //Load .env file were mongodb URL is added

const mongoose = require('mongoose')

// MONGODB CONNECTION
console.log(process.env.MONGODB_URL,"kkkk");

const dbConnection = async()=>{
    try{
        const connect= mongoose.connect(`${process.env.MONGODB_URL}`)
          console.log('Connected to MongoDB');

    }catch(error){
        console.log('mongodb connection error',error);
    }
}

module.exports = dbConnection 