
// create db connection
const mongoose = require('mongoose');

function connectdb(){
    mongoose.connect(process.env.MONGODB)
    .then(console.log('Connected to Mongodb'))
    .catch((err)=>{
        console.log("Mongodb error occurred",err);
    })
}

module.exports = connectdb;