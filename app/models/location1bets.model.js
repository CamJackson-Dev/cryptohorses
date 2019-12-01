const mongoose = require("mongoose");

const Location1BetsSchema = mongoose.Schema(
  {
    playerAddress: {
      type: String,
      trim: true,
      required: true
    },
    orderId: {
      type: Number,
      required: true
    },
    predictedHorse: {
      type: [
        {
          horse: {
            type: Number,
            required: true
          },
          win: {
            type: Number,
            required: true
          },
          place: {
            type: Number,
            required: true
          },
          show: {
            type: Number,
            required: true
          }
        }
      ],
      validate: [val => val.length === 1, "{PATH} must be array length 1"]
    },
    leaderboard: {
      type: Array,
      validate: [val => val.length === 8, "{PATH} must be array length 8"]
    },
    // winHorse: {
    //   type: Number,
    //   required: true
    // },
    // placeHorse: {
    //   type: Number,
    //   required: true
    // },
    // showHorse: {
    //   type: Number,
    //   required: true
    // },
    winAmount: {
      type: Number,
      required: true
    },
    transactionHash: {
      type: String,
      trim: true,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Location1Bets", Location1BetsSchema);
