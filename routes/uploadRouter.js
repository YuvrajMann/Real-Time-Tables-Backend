const express = require("express");
const multer = require("multer");
const authenticate = require("../authenticate.js");
var User = require("../models/users");
var fs = require("fs");
var path = require("path");
const { exists } = require("../models/users");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    var m = file.originalname.match(/\.(jpg|jpeg|png|gif)$/);
    let fileName = `${req.user.username}_profile${m[0]}`;
    cb(null, fileName);
  },
});

const imageFileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error("You can upload only image files!"), false);
  }
  cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFileFilter });
var uploadRouter = express.Router();
uploadRouter
  .route("/profilePic")
  .post(
    authenticate.verifyUser,
    (req, res, next) => {
      console.log("da");
      User.findById(req.user._id)
        .then(
          (user) => {
            var userObj = user.toObject();
            console.log(userObj);
            if (userObj.hasOwnProperty("profilePic") && userObj["profilePic"]) {
              fs.exists(userObj.profilePic, (exists) => {
                console.log(exists);
                if (!exists) {
                  next();
                } else {
                  fs.unlink(userObj.profilePic, (err) => {
                    if (err) {
                      next(err);
                    }
                    console.log("path/file.txt was deleted");
                    next();
                  });
                }
              });
            } else {
              next();
            }
          },
          (err) => {
            next(err);
          }
        )
        .catch((err) => {
          next(err);
        });
    },
    upload.single("profile"),
    (req, res, next) => {
      var filePath = req.file.path;
      User.findByIdAndUpdate(
        req.user._id,
        { $set: { profilePic: filePath } },
        { new: true }
      )
        .then(
          (user) => {
            console.log(user);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(req.file);
          },
          (err) => {
            next(err);
          }
        )
        .catch((err) => {
          next(err);
        });
    },
    (err) => {
      next(err);
    }
  )
  .put((req, res, next) => {
    res.statusCode = 501;
    res.setHeader("Content-Type", "application/json");
    res.end("Put operation not supported");
  })
  .get(authenticate.verifyUser, (req, res, next) => {
    User.findById(req.user._id)
      .then(
        (user) => {
          var userObj = user.toObject();
          if (userObj.hasOwnProperty("profilePic") && userObj["profilePic"]) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json({ "Profile Pic": userObj["profilePic"] });
          } else {
            var error = new Error();
            error.status = 404;
            error.message = "No profile pic found";
            next(error);
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
  .delete(authenticate.verifyUser, (req, res, next) => {
    User.findById(req.user._id)
      .then(
        (user) => {
          var userObj = user.toObject();

          User.findByIdAndUpdate(req.user._id, { $set: { profilePic: null } })
            .then(
              (response) => {
                if (
                  userObj.hasOwnProperty("profilePic") &&
                  userObj["profilePic"]
                ) {
                  fs.exists(userObj.profilePic, (exists) => {
                    if (!exists) {
                      next(err);
                    } else {
                      fs.unlink(userObj.profilePic, (err) => {
                        if (err) {
                          next(err);
                        } else {
                          res.statusCode = 200;
                          res.setHeader("Content-Type", "application/json");
                          res.end(
                            `User profile at path ${userObj.profilePic} successfully deleted`
                          );
                        }
                      });
                    }
                  });
                }
              },
              (err) => {
                next(err);
              }
            )
            .catch((err) => {
              next(err);
            });
        },
        (err) => {
          next(err);
        }
      )
      .catch((err) => {
        next(err);
      });
  });

//Download profile pic

uploadRouter.route("/profilePic/download").get((req, res, next) => {
  console.log(req.query);
  res.download(req.query.pic);
});

module.exports = uploadRouter;
