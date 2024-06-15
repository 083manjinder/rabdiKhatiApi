const mongoose = require("mongoose");

const authSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.Mixed,
    ref: "User",
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expiryDate: {
    type: Date,
    default: Date.now,
  },
  loginDate: {
    type: Date,
    default: Date.now,
  },
});

const Auth = mongoose.model("Auth", authSchema);

module.exports = Auth;
