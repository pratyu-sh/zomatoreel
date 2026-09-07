const userModel = require('../models/user.model');
const foodpartnermodel = require('../models/foodpartner.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

async function registerUser(req, res) {
    try {
        const { fullName, email, password } = req.body;

        const isUserAlreadyExists = await userModel.findOne({ email });

        if (isUserAlreadyExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await userModel.create({ fullName, email, password: hashedPassword });

        const token = jwt.sign({ id: user._id }, JWT_SECRET);
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        });

        res.status(201).json({
            message: "User registered successfully",
            user: { id: user._id, fullName: user.fullName, email: user.email }
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
}

async function loginUser(req, res) {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Email or Password not found" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Email or Password is incorrect" });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET);
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        });

        res.status(200).json({
            message: "User logged in successfully",
            user: { id: user._id, fullName: user.fullName, email: user.email }
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
}

async function logoutUser(req,res){
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    res.status(200).json({message:"User logged out successfully"});

}


async function registerFoodPartner(req,res){
    const { name , email ,password , address , contactName , phone} = req.body;
    const isFoodPartnerAlreadyExists = await foodpartnermodel.findOne({ email });

    if(isFoodPartnerAlreadyExists){
        return res.status(400).json({message:"Food Partner already exists"});
    }

    const hashedPassword = await bcrypt.hash(password,10);
    const foodPartner = await foodpartnermodel.create({name,email,password:hashedPassword,contactName,phone,address});

    const token = jwt.sign({id:foodPartner._id},JWT_SECRET);
    res.cookie("token",token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });


    res.status(201).json({
        message:"Food Partner registered successfully",
        foodpartner:{id:foodPartner._id,name:foodPartner.name,email:foodPartner.email, phone:foodPartner.phone, address:foodPartner.address, contactName:foodPartner.contactName}

    })
}

async function loginFoodPartner(req,res){
    const {email,password} = req.body;
    const foodPartner = await foodpartnermodel.findOne({email});

    if(!foodPartner){
        return res.status(400).json({message:"Email or Password not found"});
    }

    const isPasswordCorrect = await bcrypt.compare(password,foodPartner.password);
    if(!isPasswordCorrect){
        return res.status(400).json({message:"Email or Password is incorrect"});
    }

    const token = jwt.sign({id:foodPartner._id},JWT_SECRET);
    res.cookie("token",token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });

    res.status(200).json({
        message:"Food Partner logged in successfully",
        foodPartner:{id:foodPartner._id,name:foodPartner.name,email:foodPartner.email}});

    }

async function logoutFoodPartner(req,res){
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    res.status(200).json({message:"Food Partner logged out successfully"});
}

module.exports = { registerUser, loginUser , logoutUser, registerFoodPartner,loginFoodPartner,logoutFoodPartner};
