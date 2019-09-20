const express = require("express");
const app = express();
const port = 5050;
// var port=process.env.PORT || 5050;
const route1 = require("./Router/route");
var mongoose = require("mongoose");
var cors = require("cors");
var bodyParser = require("body-parser");
//this is for session for logout
var cookieParser = require("cookie-parser");
var session = require("express-session");
app.use(cookieParser());
app.use(
  session({
    secret: "djhxcvxfgshjfgjhgsjhfgakjeauytsdfy",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
  })
);

app.use("/public", express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data

app.use(function(req, res, next) {
  // Website you wish to allow to connect
  // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.setHeader("Access-Control-Allow-Origin", "*");
  // Request methods you wish to allow
  res.setHeader("Access-Control-Allow-Methods","GET, POST, OPTIONS, PUT, PATCH, DELETE");

  // Request headers you wish to allow
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

app.use(cors());

app.set("views", __dirname + "/Views");
app.set("view engine", "ejs");
app.use("/", route1);

if (mongoose.connection.readyState == 2) {
  console.log("mongoose Connected");
} else {
  console.log("mongoose is not Connected");
}
app.listen(port, () => {
  console.log(`server at started port ${port}`);
});

