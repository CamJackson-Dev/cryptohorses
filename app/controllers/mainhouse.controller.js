const MainHouse = require("../models/mainhouse.model.js");

// Create and Save a new MainHouse Data
exports.create = async (req, res) => {
  // Create a Note
  let mainhouse = new MainHouse({
    totalWaggeredAmount: req.body.totalWaggeredAmount,
    totalProfitAmount: req.body.totalProfitAmount,
    totalLoseAmount: req.body.totalLoseAmount,
    totalNumberOfBet: req.body.totalNumberOfBet,
    totalDividendPaid: req.body.totalDividendPaid
  });


  try {
  const mainhouselength = await MainHouse.find();

  if (mainhouselength.length > 0)
    return res.status(400).send({
      message: "Main house already exist"
    });

    mainhouse = await mainhouse.save();
    return res.send({ mainhouse });
  } catch (error) {
    return res.status(400).send({
      ...error
    });
  }
};

// Retrieve and return all notes from the database.
exports.find = async (req, res) => {
  try {
    let mainhouse = await MainHouse.findOne();
    if (!!mainhouse) {
      return res.send({ mainhouse });
    }
    return res.status(400).send({
      message: "Main house not exist"
    });
  } catch (error) {
    return res.status(400).send({
      ...error
    });
  }
};

// Retrieve total paid amount from the database.
exports.getTotalWonAMount = async (req, res) => {
  try {
    let mainhouse = await MainHouse.findOne();
    if (!!mainhouse) {
      var totalPaidAmt = mainhouse.totalPaidAmount;
      return res.send({ totalPaidAmt });
    }
    return res.status(400).send({
      message: "Main house not exist"
    });
  } catch (error) {
    return res.status(400).send({
      ...error
    });
  }
};

// Retrieve total paid amount from the database.
exports.nextWinnaDropTime = async (req, res) => {
  try {
    let mainhouse = await MainHouse.findOne();
    if (!!mainhouse) {
      var nextWinnaDrop = mainhouse.nextDividendDistribution;
      return res.send({ nextWinnaDrop });
    }
    return res.status(400).send({
      message: "Main house not exist"
    });
  } catch (error) {
    return res.status(400).send({
      ...error
    });
  }
};

// Retrieve and return all notes from the database.
exports.update = async (req, res) => {
  try {
    let mainhouse = await MainHouse.findOne();
    if (!!mainhouse) {
      mainhouse = await MainHouse.findByIdAndUpdate(
        mainhouse.id,
        {
          totalWaggeredAmount:
            mainhouse.totalWaggeredAmount +
            parseInt(req.body.totalWaggeredAmount),
          totalPaidAmount:
            mainhouse.totalPaidAmount + parseInt(req.body.totalPaidAmount),
          totalNumberOfBet:
            mainhouse.totalNumberOfBet + parseInt(req.body.totalNumberOfBet),
          totalDividendPaid:
            mainhouse.totalDividendPaid + parseInt(req.body.totalDividendPaid)
        },
        { new: true }
      );
      return res.send({ mainhouse });
    }
    return res.status(400).send({
      message: "Main house not exist"
    });
  } catch (error) {
    return res.status(400).send({
      ...error
    });
  }
};
