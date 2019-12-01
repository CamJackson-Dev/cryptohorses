const mongoose = require("mongoose");

const Location2BetsSchema = mongoose.Schema(
  {
    playerAddress: {
      type: String,
      trim: true
    },
    predictedHorse: [
      {
        horse: Number,
        win: Number,
        place: Number,
        show: Number
      }
    ],
    winHorse: Number,
    placeHorse: Number,
    showHorse: Number,
    winAmount: Number,
    transactionHash: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Location2Bets", Location2BetsSchema);
