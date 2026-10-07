const todoM = require("../models/todo.m");

async function createTodo(req, res) {

    const user = req.user   // { login: exuser.login, id: exuser._id }
    const data = await todoM.create({
        todo: req.body.todo,
        iscomplite: req.body.iscomplite,
        author: user.id
    })

    res.json(data)
}

async function getTodo(req, res) {
    try {
        // Əvvəlki xətanın təkrarlanmaması üçün id yoxlanışı
        const userId = req.user.id || req.user._id;

        const todos = await todoM
            .find({ author: userId })
            .populate("author", "login name"); // Yalnız 'login' və 'name' sahələrini gətirir

        res.status(200).json(todos);
    } catch (error) {
        res.status(500).json({ message: "Xəta baş verdi", error: error.message });
    }
}
module.exports = { createTodo, getTodo }