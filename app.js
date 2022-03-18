var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
//Morgan responsible for logs on the cmd
var logger = require("morgan");
var session = require("express-session");
var FileStore = require("session-file-store")(session);
var passport = require("passport");
var authenticate = require("./authenticate");
var config = require("./config");

var indexRouter = require("./routes/index");
var users = require("./routes/users");
var dishRouter = require("./routes/dishRouter");
var promoRouter = require("./routes/promoRouter");
var leaderRouter = require("./routes/leaderRouter");
var uploadRouter = require("./routes/uploadRouter")

const mongoose = require("mongoose");

const Dishes = require("./models/dishes");

const url = config.mongoUrl;
const connect = mongoose.connect(url);

//Establish connection to the server
connect.then(
  (db) => {
    console.log("Connected Correctly to server");
  },
  (err) => console.log(err)
);

var app = express();

app.all("*", (req, res, next) => {
  if (req.secure) {
    return next();
  } else {
    res.redirect(
      307,
      "https://" + req.hostname + ":" + app.get("secPort") + req.url
    );
  }
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

//The app will use the middleware in the below sequence. thats why before serving up static files from our server we do authentication first
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser("12345-67890-12345-67890"));

// app.use(
//   session({
//     name: "session-id",
//     secret: "12345-67890-12345-67890",
//     saveUninitialized: false,
//     resave: false,
//     store: new FileStore(),
//   })
// );

app.use(passport.initialize());
// app.use(passport.session());

app.use("/", indexRouter);
app.use("/users", users);

// function auth(req, res, next) {
//   console.log(req.session);
//   if (!req.session.user) {
//     var authHeader = req.headers.authorization;
//     if (!authHeader) {
//       var err = new Error("You are not authenticated!");
//       res.setHeader("WWW-Authenticate", "Basic");
//       err.status = 401;
//       return next(err);
//     }
//     //1st element of the split array will be basic and 2nd will be base64 encoding
//     //2nd Split array will split username and password
//     var auth = new Buffer.from(authHeader.split(" ")[1], "base64")
//       .toString()
//       .split(":");
//     var username = auth[0];
//     var password = auth[1];

//     if (username === "admin" && password === "password") {
//       // res.cookie("user", "admin", { signed: true }); //check if username == "admin" , signed:true as we are using signed cookies
//       //Client is authenticated so pass the request tot the next middleware
//       req.session.user = "admin";
//       next();
//     } else {
//       var err = new Error("You are not authenticated!");
//       res.setHeader("WWW-Authenticate", "Basic");
//       err.status = 401;
//       return next(err);
//     }
//   } else {
//     if (req.session.user === "admin") {
//       next();
//     } else {
//       var err = new Error("You are not authenticated!");
//       err.status = 401;
//       return next(err);
//     }
//   }
// }

// function auth(req, res, next) {
//   console.log(req.user);

//   if (!req.user) {
//     var err = new Error("You are not authenticated!");
//     err.status = 403;
//     return next(err);
//   } else {
//     next();
//   }
// }

// app.use(auth);

app.use(express.static(path.join(__dirname, "public")));

app.use("/dishes", dishRouter);
app.use("/promotions", promoRouter);
app.use("/leaders", leaderRouter);
app.use("/imageUpload", uploadRouter);

// Catch 404 and forward to error handler
// Next passes the request from one middleware to the next middleware
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
