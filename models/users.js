var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var passportLocalMongoose = require("passport-local-mongoose");

var User = new Schema({
  admin: {
    type: Boolean,
    default: false,
  },
  username: {
    type: String,
    required: true,
  },
  profilePic: {
    type: String,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
  },
  age: {
    type: Number,
    required: true,
  },
  sex: {
    type: String,
    required: true,
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
