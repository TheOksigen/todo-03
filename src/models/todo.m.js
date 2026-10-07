const { default: mongoose } = require("mongoose");

const todoSchema = new mongoose.Schema({
    todo: {
        type: String,
        required: true
    },
    iscomplite: {
        type: String,
        required: false,
        default: false
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    }
})


module.exports = mongoose.model("Todo", todoSchema)