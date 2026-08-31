const foodpartnermodel = require('../models/foodpartner.model');
const foodModel = require('../models/food.model');
async function getFoodPartnerById(req,res){
    const foodPartnerById = req.params.id;
    const foodPartner = await foodpartnermodel.findById(req.params.id);
    const foodPartnerItems = await foodModel.find({foodPartner:foodPartnerById});

    if(!foodPartner) return res.status(404).
    json({message:"Food Partner not found"});

    res.status(200).json({
        message:"Food Partner fetched successfully",
        foodPartner:{
            ...foodPartner.toObject(),
            foodItems:foodPartnerItems


        }
    });
}


module.exports = { getFoodPartnerById};