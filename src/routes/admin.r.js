const express = require("express");
const { getAllUsersWithTodos } = require("../service/admin.s");
const router = express.Router();


// getusers, updateauser, deleteusers, create user*, gettodos, deletetodos

router.get("/getUsers", getAllUsersWithTodos)
// router.post("/updateaUser"auth, isAdmin)
// router.delete("/deleteUsers"auth, isAdmin)
// router.get("/createUser"vauth, isAdmin)*

module.exports = router