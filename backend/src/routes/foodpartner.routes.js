const express  = require('express');
const router = express.Router();
const foodpartnercontroller = require('../controllers/foodpartner.controller');
const authMiddleware = require('../middlewares/auth.middleware');
// /api/foodpartner/:id
router.get('/:id',authMiddleware.authUserMiddleware, foodpartnercontroller.getFoodPartnerById  )



module.exports = router;