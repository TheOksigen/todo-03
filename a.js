require("dotenv").config();
const jwt = require("jsonwebtoken");
const usersM = require("./src/models/users.m");

async function salam() {
    try {
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6ImRhdmlkQGRhdmlkanMuZGV2IiwiaWF0IjoxNzkwMzI2ODcwfQ.-9LCxRsj683EIV0azGH2uWRGrtCurG1JvAoPzon8Z70";

        const data = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded data:", data);

        // req.user = data

        // getTodos{
        // req.user.login
        // }
        return data;
    } catch (err) {
        console.error("JWT verification failed:", err.message);
    }
}


salam();


const data = fetch("url", {
    headers: {
        "Accept": "application/json",
        "Authorization", `Bearer ${token}`,
    }
})

data.masa