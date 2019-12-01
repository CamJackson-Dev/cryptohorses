const mongoose = require("mongoose");

const IndividualPlayerSchema = mongoose.Schema(
  {
    playerAddress: {
      type: String,
      trim: true,
      required: true
    },
    username: {
      type: String,
      trim: true
    },
    imgNumber: {
      type: Number,
      default: 1
    },
    totalBetAmountAll: {
      type: Number,
      default: 0
    },
    totalBeAmountLocation1: {
      type: Number,
      default: 0
    },
    totalBetAmountLocation2: {
      type: Number,
      default: 0
    },
    totalBetAmountLocation3: {
      type: Number,
      default: 0
    },
    totalBetAmountLocation4: {
      type: Number,
      default: 0
    },
    totalBetLocation1: {
      type: Number,
      default: 0
    },
    totalBetLocation2: {
      type: Number,
      default: 0
    },
    totalBetLocation3: {
      type: Number,
      default: 0
    },
    totalBetLocation4: {
      type: Number,
      default: 0
    },
    totalWinAmount: {
      type: Number,
      default: 0
    },
    totalLoseAmount: {
      type: Number,
      default: 0
    },
    signLocation1: {
      type: String,
      trim: true,
      default: "-"
    },
    signLocation2: {
      type: String,
      trim: true,
      default: "-"
    },
    signLocation3: {
      type: String,
      trim: true,
      default: "-"
    },
    signLocation4: {
      type: String,
      trim: true,
      default: "-"
    },
    signChat: {
      type: String,
      trim: true,
      default: "-"
    },
    orderId: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("IndividualPlayer", IndividualPlayerSchema);
