const mongoose = require('mongoose');


const userSchema = mongoose.Schema({ 
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: true,
    },
    password: {
        required: true,
        type: String
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    roll: { 
        type: String,
        default: 'agent',
        enum: ["agent", "super_admin", "admin"],
    },
    enabled: {
        type: Boolean,
        default: true
    },
    business: {type: mongoose.Schema.Types.ObjectId, ref: "Business"},
    resetPasswordOtp: Number,
    resetPasswordOtpExpire: Date,
 });

 userSchema.index({email: 1}, {unique: true});

 userSchema.set('toObject', { virtual: true });

 userSchema.set('toJSON', { virtual: true });


 exports.User = mongoose.model('User', userSchema);