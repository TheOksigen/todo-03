const jwt = require('jsonwebtoken');
const usersM = require('../models/users.m');


function auth(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "Token daxil edilməyib" });
    }

    const token = authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Keçərsiz və ya vaxtı bitmiş token" });
    }
}

async function isAdmin(req, res, next) {
    const id = req.user.id

    const user = await usersM.findById(id)
    if (user && user.role == "ADMIN") {
        return next()
    }
    return res.status(403).json({ message: "you dont have permition" })
}

module.exports = { auth, isAdmin }