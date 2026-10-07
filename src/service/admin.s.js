const usersM = require("../models/users.m");







/**
 * Bütün istifadəçiləri və query parametrinə əsasən onların todolarını gətirir.
 * Nümunə sorğular:
 *   GET /api/admin/users
 *   GET /api/admin/users?iscomplite=true
 *   GET /api/admin/users?iscomplite=false&search=kitab
 */
async function getAllUsersWithTodos(req, res) {
    try {
        const { iscomplite, search } = req.query;

        const todoMatch = {};

        if (iscomplite !== undefined) {
            todoMatch.iscomplite = iscomplite === "true";
        }

        if (search) {
            todoMatch.todo = { $regex: search, $options: "i" };
        }


        const users = await usersM.find()
            .select("-password") // Təhlükəsizlik üçün şifrə sahəsini gizlədir
            .populate({
                path: "todos",
                match: todoMatch,
                select: "todo iscomplite createdAt"
            });

        return res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Xəta baş verdi",
            error: error.message
        });
    }
}

module.exports = { getAllUsersWithTodos };