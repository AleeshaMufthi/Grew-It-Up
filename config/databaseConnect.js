const mongoose = require('mongoose')

// MONGODB CONNECTION

const dbConnection = async()=>{
    try{
        await mongoose.connect('mongodb://127.0.0.1:27017/pots',
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