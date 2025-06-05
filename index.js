import express from "express";
import axios from "axios";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 3000;
const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});
db.connect();

let accounts = [];

async function checkAccount(req){
    const result = await db.query("SELECT email, password FROM users");
    accounts = result.rows;
    const inputEmail = req.body.email;
    const inputPassword = req.body.password;
    return accounts.find((account) => account.email == inputEmail && account.password == inputPassword);
}

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get("/login", (req, res) => {
    res.render("login.ejs");
});

app.get("/dashboard", (req, res) => {
    res.render("dashboard.ejs");
})

app.post("/login", async (req, res) => {
    const user = await checkAccount(req);
    if(user){
        res.redirect("/dashboard");
    } else {
        res.send("Invalid email or password")
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});