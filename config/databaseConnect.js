require('dotenv').config(); //Load .env file were mongodb URL is added

const mongoose = require('mongoose')

// MONGODB CONNECTION


const dbConnection = async()=>{
    try{
        await mongoose.connect("mongodb+srv://aleeshamufthi:grewitup@cluster0.mcm0niu.mongodb.net/pots");
          console.log('Connected to MongoDB');

    }catch(error){
        console.log('mongodb connection error',error);
    }
}

module.exports = dbConnection 