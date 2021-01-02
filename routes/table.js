var express = require("express");
var tableRouter = express.Router();
var bodyParser = require("body-parser");
var authenticate = require("../authenticate");
var Tables = require("../models/tables");
const Table = require("../models/tables");
tableRouter.use(bodyParser.json());

var days = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
};
tableRouter.get("/", authenticate.verifyUser, (req, res, next) => {
  Tables.find({ user: req.user._id })
    .populate("user")
    .then(
      (tables) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(tables);
      },
      (err) => next(err)
    )
    .catch((err) => {
      next(err);
    });
});
tableRouter
  .post("/", authenticate.verifyUser, (req, res, next) => {
    req.body.user = req.user._id;
    Tables.create(req.body)
      .then(
        (table) => {
          if (table) {
            Tables.findById(table._id)
              .populate("user")
              .then(
                (populatedTable) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(populatedTable);
                },
                (err) => next(err)
              )
              .catch((err) => {
                next(err);
              });
          } else {
            var err = new Error();
            err.statusCode = 500;
            next(err);
          }
        },
        (err) => {
          next(err);
        }
      )
      .catch((err) => {
        next(err);
      });
  })
  .delete("/", authenticate.verifyUser, (req, res, next) => {
    var err = new Error(
      "DELETE Operation not supported on '/tables' end point"
    );
    err.statusCode = 405;
    next(err);
  })
  .put("/", authenticate.verifyUser, (req, res, next) => {
    var err = new Error("PUT Operation not supported on '/tables' end point");
    err.statusCode = 405;
    next(err);
  });

tableRouter
  .route("/:tableId")
  .get(authenticate.verifyUser, (req, res, next) => {
    Tables.findById(req.params.tableId)
      .populate("user")
      .then(
        (table) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(table);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Tables.findOneAndRemove(req.params.tableId)
      .then(
        (table) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(table);
        },
        (err) => {
          next(err);
        }
      )
      .catch((err) => next(err));
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    Tables.findById(req.params.tableId)
      .then(
        (table) => {
          var update = req.body;
          for (var key of Object.keys(update)) {
            if (days.hasOwnProperty(key)) {
              const period = update[key].period;
              const new_sub = update[key].new_subject;
              table.table[days[key]].schedule[period] = new_sub;
            } else {
              var err = new Error("Invalid day/key detected");
              next(err);
            }
          }
          table
            .save()
            .then(
              (table) => {
                Tables.findById(table._id)
                  .populate("user")
                  .then((pop_table) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(pop_table);
                  })
                  .catch((err) => next(err));
              },
              (err) => next(err)
            )
            .catch((err) => next(err));
        },
        (err) => {
          next(err);
        }
      )
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    var error = new Error(
      "Post operation not supported on /tables/tableId end point"
    );
    next(err);
  });
module.exports = tableRouter;
