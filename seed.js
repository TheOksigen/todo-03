require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const connect = require("./src/db/db");
const User = require("./src/models/users.m");
const Todo = require("./src/models/todo.m");

async function seed() {
    try {
        await connect();

        // Köhnə məlumatları təmizləyirik
        await Todo.deleteMany({});
        await User.deleteMany({});
        console.log("Köhnə məlumatlar silindi.");

        const defaultPassword = await bcrypt.hash("123456", 12);
        const davidPassword = await bcrypt.hash("2004daviddavid", 12);
        const defaultImg = "https://www.freeiconspng.com/uploads/person-icon--icon-search-engine-3.png";

        // 10 İstifadəçi (ADMIN və USER qarışıq)
        const usersData = [
            {
                name: "David Məmmədov",
                login: "david@davidjs.dev",
                password: davidPassword,
                role: "ADMIN",
                userimg: defaultImg
            },
            {
                name: "Əli Əliyev",
                login: "ali@example.com",
                password: defaultPassword,
                role: "ADMIN",
                userimg: defaultImg
            },
            {
                name: "Aysel Həsənova",
                login: "aysel@example.com",
                password: defaultPassword,
                role: "USER",
                userimg: defaultImg
            },
            {
                name: "Rəşad Quliyev",
                login: "rashad@example.com",
                password: defaultPassword,
                role: "USER",
                userimg: defaultImg
            },
            {
                name: "Nigar Məmmədova",
                login: "nigar@example.com",
                password: defaultPassword,
                role: "ADMIN",
                userimg: defaultImg
            },
            {
                name: "Orxan Hüseynov",
                login: "orxan@example.com",
                password: defaultPassword,
                role: "USER",
                userimg: defaultImg
            },
            {
                name: "Leyla Abdullayeva",
                login: "leyla@example.com",
                password: defaultPassword,
                role: "USER",
                userimg: defaultImg
            },
            {
                name: "Tural Kərimov",
                login: "tural@example.com",
                password: defaultPassword,
                role: "USER",
                userimg: defaultImg
            },
            {
                name: "Günay Babayeva",
                login: "gunay@example.com",
                password: defaultPassword,
                role: "ADMIN",
                userimg: defaultImg
            },
            {
                name: "Kamran İsmayılov",
                login: "kamran@example.com",
                password: defaultPassword,
                role: "USER",
                userimg: defaultImg
            }
        ];

        const users = await User.insertMany(usersData);
        console.log(`${users.length} istifadəçi yaradıldı (ADMIN və USER qarışıq).`);

        // 1000 Todo yaratmaq üçün tapşırıq şablonları
        const taskTemplates = [
            "Node.js və Express ilə Auth sistemini yoxlamaq",
            "Todo CRUD əməliyyatlarını test etmək",
            "Zod ilə request validation əlavə etmək",
            "MongoDB indeks və sorğularını optimallaşdırmaq",
            "JWT və isAdmin middleware-ni yoxlamaq",
            "Frontend üçün API sənədlərini yeniləmək",
            "CORS və təhlükəsizlik başlıqlarını tənzimləmək",
            "Bcrypt ilə şifrələmə modulunu yoxlamaq",
            "Postman kolleksiyasına yeni endpoint-lər əlavə etmək",
            "Server loglarını və xəta idarəetməsini (error handling) təkmilləşdirmək",
            "Yeni istifadəçi rollarını (ADMIN, USER) test etmək",
            "Verilənlər bazası ehtiyat nüsxəsini (backup) yoxlamaq",
            "Unit və integration testləri yazmaq",
            "Docker konteyner tənzimləmələrini hazırlamaq",
            "CI/CD pipeline konfiqurasiyasını yoxlamaq",
            "Profil şəkli yükləmə funksiyasını əlavə etmək",
            "Pagination və filterləmə funksiyasını yazmaq",
            "Rate limiting middleware əlavə etmək",
            "Kod реfaktorinqi və təmizləmə işləri aparmaq",
            "Production mühitinə deploy hazırlığı görmək"
        ];

        const todosData = [];
        const totalTodos = 1000;

        for (let i = 0; i < totalTodos; i++) {
            const user = users[i % users.length];
            const template = taskTemplates[i % taskTemplates.length];
            const isComplite = i % 3 === 0 ? "true" : "false";

            todosData.push({
                todo: `${template} (#${i + 1})`,
                iscomplite: isComplite,
                author: user._id
            });
        }

        const todos = await Todo.insertMany(todosData);
        console.log(`${todos.length} todo yaradıldı.`);

        console.log("\n--- İstifadəçilər üçün JWT Tokenlər ---");
        for (const user of users) {
            const token = jwt.sign(
                { login: user.login, id: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: "999999h" }
            );
            console.log(`\n[${user.role}] ${user.name} (${user.login}) [id: ${user._id}]:`);
            console.log(token);
        }

        console.log("\nSeed prosesi uğurla tamamlandı!");
    } catch (error) {
        console.error("Seed zamanı xəta baş verdi:", error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

seed();
