var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var User = require("./models/user");
var JwtStrategy = require("passport-jwt").Strategy;
var ExtractJwt = require("passport-jwt").ExtractJwt;
var jwt = require("jsonwebtoken");

var config = require("./config");

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function (user) {
  return jwt.sign(user, config.secretKey, { expiresIn: 3600 }); // Creates JWT //user(payload,secretKey,options)
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); //Ways of extracting JWT
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    console.log("JWT payload: ", jwt_payload);
    User.findOne({_id: jwt_payload._id }, (err, user) => {
      if (err) {
        return done(err, false); //again done is the callback passport will pass to our strategy //done has 3 params (see intellisense suggestions)
      } else if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
  })
); //use(opts,verifyFunction) //done is callback provided by passport. Done can be used for passing info back to passport

exports.verifyUser = passport.authenticate('jwt',{session:false}) //We are not creating sessions as we are using session based authentication //.authenticate(strategy,options)
