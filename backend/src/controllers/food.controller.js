const foodModel = require('../models/food.model');
const LikeModel = require('../models/likes.model');
const saveModel = require('../models/save.model');
const storageservice = require('../services/storage.service');
const {v4:uuid} = require("uuid")
async function createFood(req,res){
    console.log(req.foodPartner);

    console.log(req.body);
    console.log(req.file);

    const fileUploadResult = await storageservice.uploadFile(req.file.buffer,uuid()+req.file.originalname);
    
    const fooditem = await foodModel.create({
        name:req.body.name,
        description:req.body.description,
        video:fileUploadResult.url,
        foodPartner:req.foodPartner._id

    })
    

    res.status(200).json({
        message:"Food item created successfully",
        food:fooditem
    })
};

async function getFoodItems(req,res){

    const fooditems = await foodModel.find({}).lean();
    const userId = req.user._id;
    const foodIds = fooditems.map((food) => food._id);
    const likedFoods = await LikeModel.find({ food: { $in: foodIds }, user: userId }).select('food').lean();
    const savedFoods = await saveModel.find({ food: { $in: foodIds }, user: userId }).select('food').lean();
    const likedFoodIds = new Set(likedFoods.map((like) => like.food.toString()));
    const savedFoodIds = new Set(savedFoods.map((save) => save.food.toString()));
    const fooditemsWithUserState = fooditems.map((food) => ({
        ...food,
        likeCount: food.LikeCount || 0,
        isLiked: likedFoodIds.has(food._id.toString()),
        isSaved: savedFoodIds.has(food._id.toString())
    }));

    res.status(201).json({
        message:"Food items fetched successfully",
        fooditems: fooditemsWithUserState
    })
}

async function Likefood(req,res){
    const {foodid} = req.body; 
    const user = req.user;

    const isAlreadyLiked = await LikeModel.findOne({food:foodid,user:user._id});
    
    if(isAlreadyLiked){
        await LikeModel.deleteOne({food:foodid,user:user._id});

        const food = await foodModel.findByIdAndUpdate(foodid,
        {$inc:{LikeCount:-1}},
        {new:true});


        return res.status(200).json({
            message:"Food unliked successfully",
            isLiked:false,
            likeCount:food?.LikeCount || 0
        })
    }
    

    const Like = await LikeModel.create({
        food:foodid,
        user:user._id
    });

    const food = await foodModel.findByIdAndUpdate(foodid,
        {$inc:{LikeCount:1}},
        {new:true});
    
    res.status(201).json({
        message:"Food liked successfully",
        Like,
        isLiked:true,
        likeCount:food?.LikeCount || 0
    });


}


async function savefood(req,res){
    const {foodid} = req.body;
    const user = req.user;
    
    const isAlreadySaved = await saveModel.findOne(
        {food:foodid,
        user:user._id
        });
    
    if(isAlreadySaved){
        await saveModel.deleteOne(
            {food:foodid,
            user:user._id
            });

        await foodModel.findByIdAndUpdate(foodid,
        {$inc:{saveCount:-1}});

         return res.status(200).json({
            message:"Food unsaved successfully",
            isSaved:false
         })
    }


    const save = await saveModel.create({
        food:foodid,
        user:user._id
    });

    await foodModel.findByIdAndUpdate(foodid,
        {$inc:{saveCount:1}});

    res.status(201).json({
        message:"Food saved successfully",
        save,
        isSaved:true
    });
}

async function getSavedFoodItems(req,res){
    const userId = req.user._id;
    const savedFoods = await saveModel.find({user:userId}).sort({createdAt:-1}).lean();
    const savedFoodIds = savedFoods.map((save) => save.food);
    const fooditems = await foodModel.find({_id:{$in:savedFoodIds}}).lean();
    const likedFoods = await LikeModel.find({ food: { $in: savedFoodIds }, user: userId }).select('food').lean();
    const likedFoodIds = new Set(likedFoods.map((like) => like.food.toString()));
    const savedOrder = new Map(savedFoodIds.map((foodId,index) => [foodId.toString(),index]));
    const fooditemsWithUserState = fooditems
        .sort((firstFood,secondFood) => savedOrder.get(firstFood._id.toString()) - savedOrder.get(secondFood._id.toString()))
        .map((food) => ({
            ...food,
            likeCount: food.LikeCount || 0,
            isLiked: likedFoodIds.has(food._id.toString()),
            isSaved: true
        }));

    res.status(200).json({
        message:"Saved food items fetched successfully",
        fooditems: fooditemsWithUserState
    });
}

module.exports = {createFood , getFoodItems , Likefood , savefood , getSavedFoodItems};
