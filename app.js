const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);


const Knex = require("knex");
const objection = require("objection");
const Model = objection.Model;
const knexConfig = require("./knexfile.js");
const knex = Knex(knexConfig.development);

// gives knex connection to objection.js
Model.knex(knex);

// convenience object that contains all the models and easy access to knex
const db = {
    "Knex": knex,
    "User": require("./models/User.js"),
};

const saltRounds = 10;
const expressSession = session({
    secret: "ssshhhhh",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 60000 // expires after 1 hour
    }
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/app/'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressSession);
io.use((socket, next) => {
    expressSession(socket.request, socket.request.res, next);
});

app.get("/", (req, res) => {
    if (req.session.userId) {
        res.sendFile(__dirname + "/app/home.html");
    } else {
        res.redirect("/signin/");
    }
});

app.get("/signin", (req, res) => {
    res.sendFile(__dirname + "/app/signin/signin.html");
});

app.get("/signup", (req, res) => {
    res.sendFile(__dirname + "/app/signup/signup.html");
});

app.post("/api/signup", async (req, res) => {
    console.log("signup");
        
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    let [user] = await db.User.query().select().where("email", email);
    
    if (user != null) {
        return res.json({ status: 403, error: `User with email '${email}' already exists` });
    }

    user = await db.User.query().insert({
        "username": username,
        "email": email,
        "password": await bcrypt.hash(password, saltRounds)
    });

    req.session.userId = user["user_id"];
    req.session.username = username;
    req.session.email = email;
    res.redirect("/");
    return res.json({ status: 200, error: null });
});

app.post("/api/signin", async (req, res) => {
    console.log("signin");

    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const [user] = await db.User.query().select().where("email", email);

    if (user == null) {
        return res.json({ status: 403, error: `There are no user with email '${email}'` }); // string interpolation
    }

    if (await bcrypt.compare(password, user.password)) {
        req.session.userId = user["user_id"];
        req.session.username = username;
        req.session.email = email;
        res.redirect("/");
        return res.json({ status : 200, error: null });
    };

    return res.json({ status : 403, error: "The password was incorrect" });
});

server.listen(3000, () => {
    console.log("Server is listening on port 3000");
});
