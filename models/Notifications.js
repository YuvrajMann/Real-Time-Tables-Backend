var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var NotifactionSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    message: {
      type: String,
      required: true,
    },
    from_user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    //Two Possible values view or edit
    access_request: {
      type: String,
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
    },
  },
  {
    timestamps: true,
  }
);

var Notification = mongoose.model("Notification", NotifactionSchema);
module.exports = Notification;
