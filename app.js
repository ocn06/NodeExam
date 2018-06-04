const express = require("express");
      session = require("express-session"),
      bodyParser = require("body-parser"),
      bcrypt = require("bcrypt"),
      cookieParser = require("cookie-parser"),
      app = express(),
      server = require("http").Server(app),
      io = require("socket.io")(server),


      Knex = require("knex"),
      objection = require("objection"),
      Model = objection.Model,
      knexConfig = require("./knexfile.js"),
      knex = Knex(knexConfig.development);

      mail = require("./mail.js");



// gives knex connection to objection.js
Model.knex(knex);

// convenience object that contains all the models and easy access to knex
const db = {
    "Knex": knex,
    "User": require("./models/User.js"),
    "Task": require("./models/Task.js")
};

const saltRounds = 10,
      expressSession = session({
        secret: "ssshhhhh",
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 60000 // expires after 1 hour
    }
});

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/app/'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressSession);
io.use((socket, next) => {
    expressSession(socket.request, socket.request.res, next);
});


app.get("/", async (req, res) => {
    if (req.session.userId) {
        res.render(__dirname + "/app/home/home", { username: req.session.username });
    } else {
       res.redirect("/signin/");
    }
});

app.get("/signin", (req, res) => {
    res.render(__dirname + "/app/signin/signin");
});

app.get("/signup", (req, res) => {
    res.render(__dirname + "/app/signup/signup");
});

app.post("/api/signup", async (req, res) => {
    console.log("/api/signup");
        
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

    mail.transporter.sendMail(mail);

    return res.json({ status: 200, error: null });
});

app.post("/api/signin", async (req, res) => {
    console.log("/api/signin");

    const email = req.body.email;
    const password = req.body.password;
    const [user] = await db.User.query().select().where("email", email);
    const [username] = await db.User.query().select().where("email", email);

    if (user == null) {
        return res.json({ status: 403, error: `There are no user with email '${email}'` }); // string interpolation
    }

    if (await bcrypt.compare(password, user.password)) {
        req.session.userId = user["user_id"];
        req.session.username = username["username"];
        req.session.email = email;
        return res.json({ status : 200, error: null });
    };

    return res.json({ status : 403, error: "The password was incorrect" });
});

io.on("connection", async socket => {
    console.log(`A client connected with userId ${socket.request.session.userId}`);

    const dbTasks = await db.Task.query()
        .join("users", join => { join.on("tasks.user_id", "=", "users.user_id")})
        .where("tasks.user_id", socket.request.session.userId)
        .select("task_id", "name", "done");

    // Sends the tasks to the client
    socket.emit("tasks", dbTasks.map(dbTask => ({
        id: dbTask.task_id,
        name: dbTask.name,
        done: !!dbTask.done
    })));

    // Listens to when the client disconnects
    socket.on('disconnect', () => {
        console.log('user disconnected');
        socket.disconnect(true);
    });

    // Listens to when the client creates a new task
    socket.on("tasks", async name => {
        console.log("The client added this task", name);
        
        const [user] = await db.User.query()
            .where({ "username": socket.request.session.username })
            .select("user_id");

        const dbTask = await db.Task.query().insert({   
            "user_id": user["user_id"].toString(),
            "name": name,
            "done": 0
        });
        
        socket.emit("tasks", [{
            id: dbTask.id,
            name: dbTask.name,
            done: !!dbTask.done
        }]);
    });

    // Listens to when the client toggles the done state of a task
    socket.on("toggleTask", async taskId => {
        const whereClause = {
            "user_id": socket.request.session.userId,
            "task_id": taskId
        };

        const [{done}] = await db.Task.query()
            .where(whereClause)
            .select("done");

        await db.Task.query()
            .update({ done: done === 0 ? 1 : 0 })
            .where(whereClause);
    });
});

server.listen(3000, () => {
    console.log("Server is listening on port 3000");
});
