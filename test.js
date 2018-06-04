const server = require("./app.js");
const user = require("./models/User.js");

const chai = require("chai");
const chaiHttp = require("chai-http");
const request = require("request");
const eer = require("err");
const expect = chai.expect;
const app = "localhost:3000";


chai.use(chaiHttp);


describe ("POST / Create a user", () => {
    it("should create a user and return status code 200", done => {
        chai.request(app)
        .post("/API/signup")
        .send({
            "username": "test2", 
            "email": "test2@test2.dk",
            "password": "test2"
        })
        .end((err, res) => {
            expect(res.status).to.equal(200);
            done();
        });
    });
});