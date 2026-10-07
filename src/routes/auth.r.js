const express = require("express")
const { register, login, me } = require("../service/auth.s")
const { auth } = require("../middleware/auth.m")
const router = express.Router()



router.post("/login", login);
router.post("/register", register);
router.get("/me", auth, me);






// resetpassword  post=> otp == otp  (5min)
// verfyotp  post=> otp == otp user
// forgetpassword -  {email} > otp 



module.exports = router