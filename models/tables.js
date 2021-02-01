var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var SpecificDay = new Schema(
  {
    day: {
      type: String,
      required: true,
    },
    schedule: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
var tableSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    subjects: {
      type: Schema.Types.Mixed,
      required: true,
    },
    tableName: {
      type: String,
      required: true,
    },
    periods: {
      type: [Schema.Types.Mixed],
      required: true,
    },
    table: [SpecificDay],
  },
  {
    timestamps: true,
  }
);

var Table = mongoose.model("Table", tableSchema);
module.exports = Table;
