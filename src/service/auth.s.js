const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');
const usersM = require("../models/users.m");


async function login(req, res) {
    try {
        const { login, password } = req.body
        //2004daviddavid

        const exuser = await usersM.findOne({ login })
        //exuser.pass = 13roiqrngunfipuq4btg87fwbw874g78fb2
        if (!exuser) {
            res.status(400).json({ "meesage": "xeta" })
            return
        }
                                    // 2004daviddavid     13roiqrngunfipuq4btg87fwbw874g78fb2
        const hashpass = await bcrypt.compare(password, exuser.password)
        console.log(exuser._id);

        if (!hashpass) {
            res.status(300).json({ "meesage": "xeta" })
            return
        }

        const token = jwt.sign({ login: exuser.login, id: exuser._id }, process.env.JWT_SECRET, { expiresIn: "999999h" })
        console.log("token", token);

        res.status(201).json({ suscces: true, token })

    } catch (error) {
        console.log(error);

    }
}


// m validation eve yazmaq 
async function register(req, res) {
    try {
        // req.vbady
        const { name, login, password, userimg } = req.body

        const exuser = await usersM.findOne({ login })

        if (exuser) {
            res.status(400).json({ "meesage": "get login ol!!!" })
            return
        }

        const hashpass = await bcrypt.hash(password, 12)
        const user = await usersM.create({ name, login, password: hashpass })

        console.log(user);

        res.status(201).json({ "message": "allah xosbext elesin" })



    } catch (error) {
        res.json({ message: error })
    }
}

async function me(req, res) {
    console.log(req.user);

    res.json({ "message": req.user })
}



module.exports = { register, login, me }





