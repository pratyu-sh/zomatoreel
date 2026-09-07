
// create server
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const authroutes = require('./routes/auth.routes');
const router = express.Router();
const foodroutes = require('./routes/food.routes');
const foodpartnerroutes = require('./routes/foodpartner.routes');
const cors = require('cors');


const allowedOrigins = [
    'http://localhost:5173',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(null, true); // Permissive or callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true
}));
app.use(express.json()); // to parse json data from request body
app.use(cookieParser());
app.use('/api/auth',authroutes);
app.use('/api/food', foodroutes);
app.use('/api/foodpartner', foodpartnerroutes);

app.get('/',(req,res)=>{
    res.send('Hello World');
});

module.exports = app;