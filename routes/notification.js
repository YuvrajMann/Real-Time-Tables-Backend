var express = require("express");
var notificationRouter = express.Router();
var bodyParser = require("body-parser");
var authenticate = require("../authenticate");
var Notification = require("../models/Notifications.js");

notificationRouter.use(bodyParser.json());

//get notification under a particular user
notificationRouter.route("/").get(authenticate.verifyUser, (req, res, next) => {
  Notification.find({ user: req.user._id })
    .then(
      (notifications) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(notifications);
      },
      (err) => {
        next(err);
      }
    )
    .catch((err) => {
      next(err);
    });
});
module.exports = notificationRouter;
