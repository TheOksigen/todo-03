const { default: mongoose } = require("mongoose");

const otpSchema = new mongoose.Schema({
    iscomplite: {
        type: Number,
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    }
})

module.exports = mongoose.model("otp", otpSchema)