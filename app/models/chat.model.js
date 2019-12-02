const mongoose = require("mongoose");

const ChatSchema = mongoose.Schema(
  {
    userAddress: {
      type: String,
      trim: true,
      required: true
    },
    userName: {
      type: String,
      trim: true,
      required: true
    },
    level: {
      type: Number,
      required: true,
      min: 3
    },
    message: {
      type: String,
      trim: true,
      maxlength: 256,
      required: true
    },
    room: {
      type: String,
      trim: true,
      maxlength: 32,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Chat", ChatSchema);
