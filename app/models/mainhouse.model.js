const mongoose = require("mongoose");

const MainHouseSchema = mongoose.Schema(
  {
    totalWaggeredAmount: {
      type: Number,
      required: true,
      defaultTo: 0
    },
    totalPaidAmount: {
      type: Number,
      required: true,
      defaultTo: 0
    },
    totalNumberOfBet: {
      type: Number,
      required: true,
      defaultTo: 0
    },
    totalDividendPaid: {
      type: Number,
      required: true,
      defaultTo: 0
    },
    dividendPaidLastTime: {
      type: Number,
      required: true,
      defaultTo: 0
    },
    nextDividendDistribution: {
      type: Number,
      required: true,
      defaultTo: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("MainHouse", MainHouseSchema);
