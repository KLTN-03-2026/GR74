const mongoose = require('mongoose')


const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        trim: true,
        maxlength: 25
    },
    username: {
        type: String,
        required: true,
        trim: true,
        maxlength: 25,
        unique: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    avatar:{
        type: String,
        default: 'https://i1.sndcdn.com/avatars-001344847665-y0ll4i-t500x500.jpg'
    },
    role: {type: String, enum: ['user', 'admin'], default: 'user'},
    isActive: {type: Boolean, default: true, index: true},
    aiEnabled: {type: Boolean, default: false, index: true},
    aiLearningFocus: {type: String, default: 'general', trim: true, maxlength: 80},
    aiEnabledAt: Date,
    premiumPayment: {
        status: {type: String, enum: ['none', 'pending', 'paid', 'cancelled'], default: 'none', index: true},
        amount: {type: Number, default: 0},
        currency: {type: String, default: 'usd'},
        stripeSessionId: String,
        stripePaymentIntentId: String,
        receiptUrl: String,
        checkoutUrl: String,
        paidAt: Date,
        updatedAt: Date
    },
    gender: {type: String, default: 'male'},
    mobile: {type: String, default: ''},
    address: {type: String, default: ''},
    story: {
        type: String, 
        default: '',
        maxlength: 200
    },
    website: {type: String, default: ''},
    followers: [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
    following: [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
    friends: [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
    friendRequests: [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
    sentRequests: [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
    blockedUsers: [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
    saved: [{type: mongoose.Schema.Types.ObjectId, ref: 'post'}]
}, {
    timestamps: true
})

userSchema.index({ username: 'text', fullname: 'text' })
userSchema.index({ followers: 1 })
userSchema.index({ following: 1 })
userSchema.index({ friends: 1 })
userSchema.index({ saved: 1 })

module.exports = mongoose.model('user', userSchema)
