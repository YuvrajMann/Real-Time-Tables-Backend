var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var passport = require("passport");
var authenticate = require("./authenticate");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var session = require("express-session");
var FileStore = require("session-file-store")(session);
var app = express();
var mongoose = require("mongoose");
var config = require("./config");
var tableRouter = require("./routes/table.js");
var logRouter = require("./routes/log.js");
var accessRouter = require("./routes/access.js");
var cors = require("./routes/cors");
var uploadRouter = require("./routes/uploadRouter");
var notificationRouter = require("./routes/notification.js");
var saveTableRouter = require("./routes/saveTableRouter.js");

app.use(logger("dev"));

const connect = mongoose.connect(config.mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

connect.then(
  (db) => {
    console.log("Connected correctly to server");
  },
  (err) => {
    console.log(err);
  }
);
// Secure traffic only
// app.all("*", (req, res, next) => {
//   console.log(req.secure);
//   if (req.secure) {
//     return next();
//   } else {
//     console.log(
//       307,
//       "https://" + req.hostname + ":" + app.get("secPort") + req.url
//     );
//     res.redirect(
//       "https://" + req.hostname + ":" + app.get("secPort") + req.url
//     );
//   }
// });
app.use("/public", express.static(path.resolve(__dirname, "public")));
app.use(cors.cors);
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(express.json());
// app.use(cookieParser("12345-67890-09876-54321"));

app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
// app.use(passport.session());
app.use("/users", usersRouter);

// function auth(req, res, next) {
//   authenticate.verifyUser().then((res) => {});
//   if (!req.user) {
//     var err = new Error("You are not authenticated!");
//     err.status = 403;
//     next(err);
//   } else {
//     next();
//   }
// }

// app.use(auth);

app.use("/", indexRouter);
app.use("/table", tableRouter);
app.use("/logs", logRouter);
app.use("/upload", uploadRouter);
app.use("/access", accessRouter);
app.use("/notifications", notificationRouter);
app.use("/savetable", saveTableRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
// Serve static assests
// if (process.env.NODE_ENV == "production") {
//   app.use(express.static("client/build"));
//   app.get("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
//   });
// }
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
