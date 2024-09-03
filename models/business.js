const mongoose = require('mongoose');



const businessSchema = mongoose.Schema({ 
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
    },
    status: {
        type: String,
        default: 'pending',
        enum: ["pending", "approved", "disabled", "removed"],
    },
    createdAt: { type: Date, default: Date.now },
 });


 businessSchema.set('toObject', { virtual: true });

 businessSchema.set('toJSON', { virtual: true });


 exports.Business = mongoose.model('Business', businessSchema);