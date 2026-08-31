
// create server
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const authroutes = require('./routes/auth.routes');
const router = express.Router();
const foodroutes = require('./routes/food.routes');
const foodpartnerroutes = require('./routes/foodpartner.routes');
const cors = require('cors');


app.use(cors(
    {
        origin:'http://localhost:5173',
        credentials:true
    }
));
app.use(express.json()); // to parse json data from request body
app.use(cookieParser());
app.use('/api/auth',authroutes);
app.use('/api/food', foodroutes);
app.use('/api/foodpartner', foodpartnerroutes);

app.get('/',(req,res)=>{
    res.send('Hello World');
});

module.exports = app;