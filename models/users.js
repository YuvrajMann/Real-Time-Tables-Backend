var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var passportLocalMongoose = require("passport-local-mongoose");

var User = new Schema({
  savedTables: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Table",
  },
  admin: {
    type: Boolean,
    default: false,
  },
  profilePic: {
    type: String,
  },
  email: {
    type: String,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  age: {
    type: Number,
  },
  sex: {
    type: String,
  },
  institutionName: {
    type: String,
  },
  standard: {
    type: String,
  },
});
User.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", User);
