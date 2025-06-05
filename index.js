import express from "express";
import axios from "axios";
import pg from "pg";
import dotenv from "dotenv";
import e from "express";
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
    const result = await db.query("SELECT * FROM users");
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

app.get("/createAccount", (req, res) => {
    res.render("createAccount.ejs");
})

app.post("/login", async (req, res) => {
    const user = await checkAccount(req);
    if(user){
        res.redirect("/dashboard");
    } else {
        res.send("Invalid email or password")
    }
});

app.post("/createAccount", async (req, res) => {
    const {fName, lName, email, fPassword, lPassword} = req.body;

    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if(result.rows.length > 0) {
        return res.send("Email is already in use.");
    }

    if(fPassword !== lPassword){
        return res.send("Passwords do not match.");
    }

    await db.query("INSERT INTO (fName, lName, email, fPassword, lPassword) VALUES ($1, $2, $3, $4, $5", [fName, lName, email, fPassword, lPassword]);
    res.redirect("/login");
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});