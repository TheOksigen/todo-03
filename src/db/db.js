const {  default: mongoose } = require("mongoose")

async function connect() {
    await mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log("db qosuldu"))
}

module.exports = connect