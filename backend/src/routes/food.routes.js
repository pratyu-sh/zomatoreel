const express = require('express');
const foodController = require('../controllers/food.controller');
const authMiddleware = require('../middlewares/auth.middleware')
const router = express.Router();
const multer = require('multer');

const upload = multer({
    storage:multer.memoryStorage(),
  
})

// /api/food   [protected]
router.post('/',authMiddleware.authFoodPartnerMiddleware,upload.single('video'),foodController.createFood);

// get mthod used by user  
// /api/food [protected]  [login of getting food items]
router.get('/',authMiddleware.authUserMiddleware,foodController.getFoodItems)

router.get('/saved',
    authMiddleware.authUserMiddleware,
    foodController.getSavedFoodItems
)


router.post('/like',
    authMiddleware.authUserMiddleware,
    foodController.Likefood);

router.post('/save',
    authMiddleware.authUserMiddleware,
    foodController.savefood
)

module.exports = router;
