var express = require("express");
var router = express.Router();
const bodyParser = require("body-parser");
var passport = require("passport");
var authenticate = require("../authenticate");
router.use(bodyParser.json());
const User = require("../models/users");

router.get("/", authenticate.verifyUser, (req, res, next) => {
  console.log(req.user);
  res.statusCode = 200;
  res.json(req.user);
});
router.post("/signup", (req, res, next) => {
  User.register(
    new User({
      username: req.body.username,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      age: req.body.age,
      sex: req.body.sex,
      institutionName: req.body.institutionName,
      standard: req.body.standard,
    }),
    req.body.password,
    (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json({ err: err });
      } else {
        passport.authenticate("local")(req, res, () => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json({ success: true, status: "Registration Successful!" });
        });
      }
    }
  );
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.json({ success: false, status: "Login Unsuccessful!", err: info });
    }
    req.logIn(user, (err) => {
      if (err) {
        res.statusCode = 401;
        res.setHeader("Content-Type", "application/json");
        res.json({
          success: false,
          status: "Login Unsuccessful!",
          err: "Could not log in user!",
        });
      }

      var token = authenticate.getToken({ _id: req.user._id });
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json({ success: true, status: "Login Successful!", token: token });
    });
  })(req, res, next);
});

router.get("/checkJWTtoken", (req, res) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      return res.json({ status: "JWT invalid!", success: false, err: info });
    } else {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      return res.json({ status: "JWT valid!", success: true, user: user });
    }
  })(req, res);
});
// router.get("/logout", (req, res) => {
//   if (req.session) {
//     req.session.destroy();
//     res.clearCookie("session-id");
//     res.redirect("/");
//   } else {
//     var err = new Error("You are not logged in!");
//     err.status = 403;
//     next(err);
//   }
// });
module.exports = router;
