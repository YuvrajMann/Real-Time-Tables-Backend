var express = require("express");
var saveTableRouter = express.Router();
var bodyParser = require("body-parser");
var authenticate = require("../authenticate");
var Users = require("../models/users.js");

saveTableRouter.use(bodyParser.json());
saveTableRouter.route("/").get(authenticate.verifyUser, (req, res, next) => {
  let user = req.user._id;
  Users.findById(user)
    .then((sres) => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json(sres.savedTables);
    })
    .catch((err) => {
      next(err);
    });
});

saveTableRouter
  .route("/saveTable")
  .post(authenticate.verifyUser, (req, res, next) => {
    let user = req.user._id;
    let tableId = req.body.table;
    Users.findById(user)
      .then((parUser) => {
        let savedTables = parUser.savedTables;
        console.log(savedTables, tableId.toString());
        let index = -1;
        var i = 0;
        for (var table in savedTables) {
          if (table.toString() == tableId.toString()) {
            index = i;
            break;
          }
          i++;
        }

        if (index > -1) {
          savedTables.push(tableId);
          parUser.savedTables = savedTables;
          parUser
            .save()
            .then((sres) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(sres);
            })
            .catch((err) => {
              next(err);
            });
        } else {
          var err = new Error("Table is already saved");
          next(err);
        }
      })
      .catch((err) => {
        next(err);
      });
  });
saveTableRouter
  .route("/removeTable")
  .delete(authenticate.verifyUser, (req, res, next) => {
    let user = req.user._id;
    let tableId = req.body.table;

    Users.findById(user)
      .then((parUser) => {
        let savedTables = parUser.savedTables;
        var i = 0;
        while (i < savedTables.length) {
          if (savedTables[i].toString() === tableId.toString()) {
            savedTables.splice(i, 1);
          } else {
            ++i;
          }
        }

        parUser.savedTables = savedTables;
        parUser
          .save()
          .then((sres) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(sres);
          })
          .catch((err) => {
            next(err);
          });
      })
      .catch((err) => {
        next(err);
      });
  });
module.exports = saveTableRouter;
