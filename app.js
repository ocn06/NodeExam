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
    "Task": require("./models/Task.js")
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
        res.sendFile(__dirname + "/app/home.html", { username: db.User.query().select("username").where("user_id", req.session.userId)})
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
    return res.json({ status: 200, error: null });
});

app.post("/api/signin", async (req, res) => {
    console.log("signin");

    const email = req.body.email;
    const password = req.body.password;
    const [user] = await db.User.query().select().where("email", email);
    const username = await db.User.query().select("username").where("email", email);

    if (user == null) {
        return res.json({ status: 403, error: `There are no user with email '${email}'` }); // string interpolation
    }

    if (await bcrypt.compare(password, user.password)) {
        req.session.userId = user["user_id"];
        req.session.username = username;
        req.session.email = email;
        console.log("username:" + username)
        return res.json({ status : 200, error: null });
    };

    return res.json({ status : 403, error: "The password was incorrect" });
});

io.on("connection", async socket => {
    console.log("A client connected with session", socket.request.session);

    // [{ 'user_id': 11, 'task_id': 1, task: 'homework' }, ...]
    const dbTasks = await db.Task.query().join("users", join => {
        join.on("tasks.user_id", "=", "users.user_id")
    }).select("username", "task");

    //sender til client ?
    socket.emit("tasks", dbTasks.map(dbTask => ({
            username: dbTask.username,
            task: dbTask.task
    })));

    //lytter til clienten og laver deklarerer objekt
    socket.on("tasks", task => {
        console.log("The client added this task", task);
        const todo = {
            username: socket.request.session.username,
            task
        };

        io.emit("tasks", [todo]);
        saveTask(todo);
    });
});

async function saveTask(todo) {
    const [user] = await db.User.query().where({ "username": task.username }).select("user_id");

    await db.Task.query().insert({   
        "user_id": user["user_id"].toString(),
        "task": todo.task
    });
};


server.listen(3000, () => {
    console.log("Server is listening on port 3000");
});
