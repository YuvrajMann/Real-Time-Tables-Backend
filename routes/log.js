var express = require("express");
var logsRouter = express.Router();
var bodyParser = require("body-parser");
var Logs = require("../models/logs.js");
var authenticate = require("../authenticate.js");

logsRouter.use(bodyParser.json());

logsRouter.route("/user");
logsRouter.route("/user/:tableId");
logsRouter.route("/:tableId").get(authenticate.verifyUser, (req, res, next) => {
  Logs.find({ table: req.params.tableId })
    .then(
      (logs) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(logs);
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
