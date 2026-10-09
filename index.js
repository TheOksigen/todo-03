const cors = require('cors');
const express = require('express');
const connect = require('./src/db/db');
require("dotenv").config()

// routerler
const authRouter = require("./src/routes/auth.r")
const todoRouter = require("./src/routes/todo.r");
const admin = require("./src/routes/admin.r");

const { auth, isAdmin } = require('./src/middleware/auth.m');

const app = express();
app.use(cors())
app.use(express.json())
connect()


// auth route
app.use("/auth", authRouter)

//todo route
app.use("/todo", auth, todoRouter)

//admin route
app.use("/admin", auth, isAdmin, admin)


app.listen(3000, () => {
    console.log(`Example app listening on port ${3000}`);
});