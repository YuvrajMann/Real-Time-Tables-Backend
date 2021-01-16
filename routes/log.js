var express = require("express");
var logsRouter = express.Router();
var bodyParser = require("body-parser");
var Logs = require("../models/logs.js");
var authenticate = require("../authenticate.js");

logsRouter.use(bodyParser.json());

logsRouter.route("/user").get(authenticate.verifyUser, (req, res, next) => {
  Logs.find({ user: req.user._id })
    .populate("user")
    .then(
      (logs) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        var response = {};
        response["count"] = logs.length;

        response["results"] = logs;
        res.json(response);
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
});
logsRouter
  .route("/user/:tableId")
  .get(authenticate.verifyUser, (req, res, next) => {
    Logs.find({ table: req.params.tableId, user: req.user._id })
      .populate("user")
      .then(
        (logs) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          var response = {};
          response["count"] = logs.length;

          response["results"] = logs;
          res.json(response);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });
logsRouter.route("/:tableId").get(authenticate.verifyUser, (req, res, next) => {
  Logs.find({ table: req.params.tableId })
    .populate("user")
    .then(
      (logs) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        var response = {};
        response["count"] = logs.length;
        response["results"] = logs;
        res.json(response);
      },
      (err) => {
        next(err);
      }
    )
    .catch((err) => {
      next(err);
    });
});
module.exports = logsRouter;
