
//creates routees and apis 
const express = require('express');
const router = express.Router();
const authcontroller = require('../controllers/auth.controller');

//logic of api is made under controller

//User Apis
router.post('/user/register', authcontroller.registerUser);
router.post('/user/login', authcontroller.loginUser);
router.post('/user/logout', authcontroller.logoutUser);


//FoodPartner Apis
router.post('/foodpartner/register', authcontroller.registerFoodPartner);
router.post('/foodpartner/login', authcontroller.loginFoodPartner);
router.post('/foodpartner/logout', authcontroller.logoutFoodPartner);


module.exports = router;