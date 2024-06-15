const mongoose = require("mongoose");

const farmSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  map_coords: {
    type: String,
    required: true
  },
  size:{
    type: String,
    required: true
  },
  owner: {
    type: String,
    required: true,
  },
  farm_type: {
    type: String,
    required: true,
    enum: [
      "Property Boundary",
      "Animal Enclosure",
      "Building",
      "Field",
      "Other",
    ],
  },
  farm_fields: [{ type: mongoose.Schema.Types.Mixed, ref: "FarmFields" }],
  isDelete: {
    type: Boolean,
    default: false,
  },
});

const Farm = mongoose.model("Farm", farmSchema);

module.exports = Farm;
