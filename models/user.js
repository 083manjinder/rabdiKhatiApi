const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone:{
    type: String,

  },
  password: {
    type: String,
    required: true,
  },
  role:{
    type: mongoose.Schema.Types.Mixed,
    ref: 'Role',
    required:true
  },
  isDelete:{
    type: Boolean,
    default: false
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
