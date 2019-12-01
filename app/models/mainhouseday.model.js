const mongoose = require("mongoose");

const MainHouseDaySchema = mongoose.Schema(
  {
    totalWaggeredAmount: Number,
    totalProfitAmount: Number,
    totalLoseAmount: Number,
    totalNumberOfBet: Number
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("MainHouseDay", MainHouseDaySchema);
