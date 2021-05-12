var express = require("express");
var tableRouter = express.Router();
var bodyParser = require("body-parser");
var authenticate = require("../authenticate");
var Tables = require("../models/tables");
var Logs = require("../models/logs.js");
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
        var results = {};
        results["results"] = tables;
        results["count"] = tables.length;
        res.json(results);
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
      .then(
        (table) => {
          console.log(req.params.tableId);
          if (table) {
            if (table.user.toString() == req.user._id.toString()) {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(table);
            } else {
              console.log(table.user, req.user._id);
              var view_bool = [];

              table.view_access.map((vuser) => {
                console.log(vuser);
                if (vuser.toString() == req.user._id) {
                  view_bool.push(vuser.toString);
                }
              });
              console.log(view_bool);
              if (view_bool.length > 0) {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(table);
              } else if (view_bool.length == 0) {
                var err = new Error();
                err.status = 403;
                err.message = "You don't have view access for this table";
                next(err);
              }
            }
          } else {
            var error = new Error("Table with specified id not found");
            next(error);
          }
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
          if (table) {
            var edit_bool = [];
            edit_bool = table.edit_access.filter((euser) => {
              return euser.toString() == req.user._id.toString();
            });
            console.log(edit_bool);
            if (
              table.user.toString() == req.user._id.toString() ||
              edit_bool.length > 0
            ) {
              var update = req.body;
              for (var key of Object.keys(update)) {
                if (key == "tableName") {
                  table["tableName"] = update["tableName"];
                } else if (days.hasOwnProperty(key)) {
                  let newSchedule = update[key];
                  let up_table = table["table"];
                  for (var period of Object.keys(newSchedule)) {
                    if (newSchedule.hasOwnProperty(period)) {
                      let change = newSchedule[period];
                      up_table[days[key]]["schedule"][period] = change;
                      var log = {};
                      log["table"] = req.params.tableId;
                      log["user"] = req.user._id;
                      log["day"] = key;
                      log["log"] = {
                        period: period,
                        new_sub: change,
                      };

                      Logs.create(log)
                        .then(
                          (new_log) => {
                            console.log(new_log);
                          },
                          (err) => next(err)
                        )
                        .catch((err) => {
                          next(err);
                        });
                    }
                  }
                  table["table"] = up_table;
                } else {
                  var err = new Error("Invalid day/key detected");
                  next(err);
                }
              }
              Tables.findByIdAndUpdate(
                table._id,
                { $set: table },
                { new: true }
              )
                .populate("user")
                .then(
                  (pop_table) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(pop_table);
                  },
                  (err) => {
                    next(err);
                  }
                )
                .catch((err) => {
                  next(err);
                });
            } else {
              var err = new Error();
              err.status = 403;
              err.message = "You don't have view access for this table";
              next(err);
            }
          } else {
            var error = new Error("Table with specified id not found");
            next(error);
          }
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
tableRouter.get(
  "/:tableId/subjects",
  authenticate.verifyUser,
  (req, res, next) => {
    Tables.findById(req.params.tableId)
      .then((table) => {
        console.log(table);
        var subInfo = table.subjects;
        if (!subInfo) {
          var err = new Error("Subject Info not available");
          next(err);
        } else {
          var result = [];
          for (var i = 1; i <= subInfo.numberOfSub; ++i) {
            const s1 = `Sub_${i}_Name`;
            const s2 = `Sub_${i}_Teacher`;
            let obj = {};
            obj["name"] = subInfo.subInfo[s1];
            obj["teacher"] = subInfo.subInfo[s2];
            result.push(obj);
          }
          var fres = {};
          fres["count"] = subInfo.numberOfSub;
          fres["subjects"] = result;
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(fres);
        }
      })
      .catch((err) => {
        next(err);
      });
  }
);
module.exports = tableRouter;
