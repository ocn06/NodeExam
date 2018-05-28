const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const server = require("http").Server(app);

const Knex = require("knex");
const objection = require("objection");
const Model = objection.Model;
const knexConfig = require("./knexfile.js");
const knex = Knex(knexConfig.development);

// gives knex connection to objection.js
Model.knex(knex);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/app/'));
app.use(bodyParser.json());

app.get("/", (res, req) => {
    res.sendFile(__dirname + "/index.html");
});

server.listen(3000, () => {
    console.log("Server is listening on port 3000");
});
