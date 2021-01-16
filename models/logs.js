var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var logsSchema = new Schema(
  {
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    day: {
      type: "String",
      required: true,
    },
    log: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

var Logs = mongoose.model("Logs", logsSchema);
module.exports = Logs;
