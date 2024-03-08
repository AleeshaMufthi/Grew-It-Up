require('dotenv').config(); //Load .env file were mongodb URL is added

const mongoose = require('mongoose')

// MONGODB CONNECTION

const dbConnection = async()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URL,
        {useNewUrlParser:true,
        useUnifiedTopology:true})

        mongoose.connection.on('connected',()=>{
            console.log('connected to mongodb');
        })
        mongoose.connection.on('error',(error)=>{
            console.log('mongodb connection error',error);
        })

    }catch(error){
        console.log('mongodb connection error',error);
    }
}

module.exports = dbConnection 