const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    login: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    userimg: {
        type: String,
        required: false,
        default: "https://www.freeiconspng.com/uploads/person-icon--icon-search-engine-3.png"
    },
    role: {
        type: String,
        enum: ['ADMIN', 'USER'],
        default: "USER"
    },
    
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

userSchema.virtual("todos", {
    ref: "Todo",
    localField: "_id",
    foreignField: "author"
});

module.exports = mongoose.model("User", userSchema);