var express = require("express");
var router = express.Router();
const bodyParser = require("body-parser");
var User = require("../models/user");
var passport = require("passport");
var authenticate = require("../authenticate");
var cors = require("./cors");

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get(
  "/",
  cors.corsWithOptions,
  authenticate.verifyUser,
  authenticate.verifyAdmin,
  (req, res, next) => {
    User.find({}, (err, users) => {
      if (err) {
        return next(err);
      } else {
        res.statusCode = 200;
        res.setHeader("Content_type", "application/json");
        res.json(users);
      }
    });
  }
);

router.post("/signup", cors.corsWithOptions, function (req, res, next) {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json({ err: err });
      } else {
        if (req.body.firstname) user.firstname = req.body.firstname;
        if (req.body.lastname) user.lastname = req.body.lastname;
        user.save((err, user) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.json({ err: err });
            return;
          }
          passport.authenticate("local")(req, res, () => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json({ success: true, status: "Registration Successful!" });
          });
        });
      }
    }
  );
});

// router.post("/login", (req, res, next) => {
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

//     User.findOne({ username: username })
//       .then((user) => {
//         if (user === null) {
//           var err = new Error("User " + username + " does not exist!");
//           err.status = 403;
//           return next(err);
//         } else if (user.password !== password) {
//           var err = new Error("Your password is incorrect!");
//           err.status = 403;
//           return next(err);
//         } else if (user.username === username && user.password === password) {
//           req.session.user = "authenticated";
//           res.statusCode = 200;
//           res.setHeader("Content-Type", "text/plain");
//           res.end("You are authenticated!");
//         }
//       })
//       .catch((err) => next(err));
//   } else {
//     res.statusCode = 200;
//     res.setHeader("Content-Type", "text/plain");
//     res.end("You are already logged in");
//   }
// });

router.post(
  "/login",
  cors.corsWithOptions,
  passport.authenticate("local"),
  (req, res) => {
    var token = authenticate.getToken({
      _id: req.user._id,
      firstname: req.user.firstname,
      lastname: req.user.lastname,
    }); //getToken(id of the user)
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.json({
      success: true,
      token: token, //token will be sent back to user/client and client will include token in every request in authorization header
      status: "You are Successfully Logged In",
    });
  }
);

//No need for post as we are not sending any info to the server
router.get("/logout", (req, res, next) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie("session-id"); //Name of cookie is stored as 'session-id'
    res.redirect("/");
  } else {
    var err = new Error("You are not logged in");
    err.status = 403;
    next(err);
  }
});

router.get(
  "/facebook/token",
  passport.authenticate("facebook-token"),
  (req, res) => {
    if (req.user) {
      var token = authenticate.getToken({
        _id: req.user._id,
      });
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json({
        success: true,
        token: token,
        status: "You are Successfully Logged In",
      });
    }
  }
);

module.exports = router;
