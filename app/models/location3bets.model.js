const mongoose = require("mongoose");

const Location3BetsSchema = mongoose.Schema(
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

module.exports = mongoose.model("Location3Bets", Location3BetsSchema);
