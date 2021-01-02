var express = require("express");
var indexrouter = express.Router();
var authenticate = require("../authenticate");
var cors = require("./cors.js");
var bodyParser = require("body-parser");

indexrouter.use(bodyParser.json());
indexrouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.render("index", { title: "Express" });
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    console.log(req.body);
    res.end();
  });

module.exports = indexrouter;
