var express = require("express");
var router = express.Router();
const bodyParser = require("body-parser");
var passport = require("passport");
var authenticate = require("../authenticate");
router.use(bodyParser.json());
const User = require("../models/users");
var jwt = require("jsonwebtoken");
var config = require("../config.js");

router.get("/", authenticate.verifyUser, (req, res, next) => {
  console.log(req.user);
  res.statusCode = 200;
  res.json(req.user);
});
router.get("/:userId", (req, res, next) => {
  User.findById(req.params.userId)
    .then(
      (user) => {
        res.statusCode = 200;
        res.json(user);
      },
      (err) => {
        next(err);
      }
    )
    .catch((err) => {
      next(err);
    });
});
router.put("/profileChange", authenticate.verifyUser, (req, res, next) => {
  User.findById(req.user)
    .then((user) => {
      var change = req.body;
      for (var key of Object.keys(change)) {
        if (change.hasOwnProperty(key)) {
          console.log(change[key]);
          user[key] = change[key];
        }
      }

      user
        .save()
        .then((user) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(user);
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
});
router.post("/signup", (req, res, next) => {
  console.log(req.body);
  User.register(
    new User({
      username: req.body.username,
      email: req.body.email,
      firstName: req.body.firstname,
      lastName: req.body.lastname,
      age: req.body.age,
      sex: req.body.sex,
      institutionName: req.body.institutionName,
      standard: req.body.standard,
    }),
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err, req.body);
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

// router.get("/checkJWTtoken", (req, res) => {
//   passport.authenticate("jwt", { session: false }, (err, user, info) => {
//     if (err) return next(err);

//     if (!user) {
//       res.statusCode = 401;
//       res.setHeader("Content-Type", "application/json");
//       return res.json({ status: "JWT invalid!", success: false, err: info });
//     } else {
//       res.statusCode = 200;
//       res.setHeader("Content-Type", "application/json");
//       return res.json({ status: "JWT valid!", success: true, user: user });
//     }
//   })(req, res);
// });

router.post("/checktoken", (req, res, next) => {
  let token = req.body.token.toString();
  jwt.verify(token, config.secretKey, (err, decoded) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.json({ err: err });
    } else {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end("Token Valid");
    }
  });
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
