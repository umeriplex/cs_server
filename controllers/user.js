const { User } = require("../models/user");
const { Token } = require("../models/token");
const { Business } = require("../models/business");
const bycrypt = require("bcryptjs");
require('dotenv/config');
const jwt = require("jsonwebtoken");

const UserController = {
    registerAdmin: async function (req, res){
        try{
            const { email, password, phone } = req.body;

            const existUser = await User.findOne({ email });
            const existPhone = await User.findOne({ phone });

            if(existUser){
                return res.status(400).json({ statusCode: 400, success: false, message: 'Users already exists with same email address.'});
            }

            if(existPhone){
                return res.status(400).json({ statusCode: 400, success: false, message: 'Users already exists with same phone number.'});
            }

            const hashPassword = await bycrypt.hash(password,8);

            let user = new User({
                ...req.body,
                password: hashPassword,
                roll: "super_admin"
            });

            user = await user.save();

            return res.status(200).json({ statusCode: 200, success: true, message: 'Registered Success.', data: user });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },


    loginAdmin: async function (req, res){
        try{
            const { email, password } = req.body;

            const user = await User.findOne({ email });

            if(!user){
                return res.status(400).json({ statusCode: 400, success: false, message: 'Users not found.'});
            }

            if(!bycrypt.compareSync(password, user.password)){
                return res.status(400).json({ statusCode: 400, success: false, message: 'Incorrect password.' });
            }

            
            const accessToken = jwt.sign(
                { 
                    id: user.id,
                    roll: user.roll,
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '24h' },
            );


            const refreshToken = jwt.sign(
                { 
                    id: user.id,
                    roll: user.roll,
                },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '60d' },
            );

            
            const token = await Token.findOne({userId: user.id});

            if(token) await token.deleteOne();

            await new Token({ userId: user.id, accessToken, refreshToken }).save();

            
            const responseUserData = await User
            .findOne({ email })
            .select('-password')
            .populate('business');


            return res.status(200).json({ statusCode: 200, success: true, message: 'Login Success.', data: {...responseUserData._doc, accessToken} });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },


    createBusiness: async function (req, res){
        try{
            const { name, description } = req.body;
            

            let accessToken = req.headers.authorization;
            if(!accessToken) return res.status(401).json({ statusCode: 401, success: false, message: 'Not Authorized.' });

            accessToken = accessToken.replace('Bearer','').trim();

            const token = await Token.findOne({accessToken});

            if(!token) return res.status(401).json({ statusCode: 401, success: false, message: 'Not Authorized.' });

            const tokenData = jwt.decode(token.refreshToken);
            const user = await User.findById(tokenData.id).populate('business');;

            if(!user) return res.status(401).json({ statusCode: 401, success: false, message: 'Not Authorized.' });

            if (user.business && user.business.status === 'pending') {
                return res.status(400).json({ statusCode: 400, success: false, message: "You've already applied for approval." });
            }

            if (user.business && user.business.status === 'disabled') {
                return res.status(400).json({ statusCode: 400, success: false, message: "You're currently disabled." });
            }

            if (user.business && user.business.status === 'removed') {
                return res.status(400).json({ statusCode: 400, success: false, message: "Your business has been deleted." });
            }

            if (user.business && user.business.status === 'approved') {
                return res.status(400).json({ statusCode: 400, success: false, message: "Your business has been approved." });
            }






            const businessName = req.body.name.trim();
            const existsBusiness = await Business.findOne({
                name: new RegExp(`^${businessName}$`, 'i')
            });

            if(existsBusiness) return res.status(400).json({ statusCode: 400, success: false, message: 'Business already registered with same name, please try unique name for your business.' });


            let business = new Business(req.body);

            business = await business.save();

            if(!business) return res.status(400).json({ statusCode: 400, success: false, message: 'Unable to create business.' });

            user.business = business;

            await user.save();

            return res.status(200).json({ statusCode: 200, success: true, message: 'Applied for approval.', data: business });

        }catch(ex){
            return res.status(500).json({ statusCode: 500, success: false, message: ex.message });
        }
    },




};


module.exports = UserController;