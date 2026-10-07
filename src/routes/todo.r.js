const express = require("express")
const { createTodo, getTodo } = require("../service/todo.s")
const router = express.Router()



router.get("/get", getTodo)
router.post("/create", createTodo)
// router.post("/update")



module.exports = router