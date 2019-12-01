const Location1Bets = require("../models/location1bets.model.js");

// Create and Save a new MainHouse Data
exports.create = async (req, res) => {
  try {
    let orderId = await Location1Bets.count({
      playerAddress: req.body.playerAddress
    });

    // Create a Note
    let location1bets = new Location1Bets({
      playerAddress: req.body.playerAddress,
      orderId: orderId + 1,
      predictedHorse: req.body.predictedHorse,
      leaderboard: req.body.leaderboard,
      winAmount: req.body.winAmount,
      transactionHash: req.body.transactionHash
    });
    location1bets = await location1bets.save();
    return res.send({ location1bets });
  } catch (error) {
    return res.status(400).send({
      ...error
    });
  }
};

// Retrieve and return all bets from the database.
exports.find = async (req, res) => {
  try {
    let location1bets = await Location1Bets.find({}, null, {
      limit: 50,
      sort: { createdAt: -1 }
    });
    return res.send({ location1bets });
  } catch (error) {
    return res.status(400).send({
      ...error
    });
  }
};

// Retrieve and return all bets of player from the database.
exports.findByPlayerAddrees = async (req, res) => {
  try {
    let location1bets = await Location1Bets.find(
      { playerAddress: req.params.id },
      null,
      {
        limit: 10,
        sort: { createdAt: -1 }
      }
    );
    return res.send({ location1bets });
  } catch (error) {
    return res.status(400).send({
      ...error
    });
  }
};

// Retrieve and return all bets of player from the database.
exports.findByPlayerAddreesWithFilter = async (req, res) => {
  try {
    let { filter = "all", page = 10, skip = 0 } = req.query;
    page = parseInt(page);
    skip = parseInt(skip);

    let where = { playerAddress: req.params.id };
    if (filter === "win") where.winAmount = { $ne: 0 };
    else if (filter === "lose") where.winAmount = 0;

    let count = await Location1Bets.countDocuments(where);

    let location1bets = await Location1Bets.find(where, {_id:0}, {
      limit: page,
      skip: skip * page,
      sort: { createdAt: -1 }
    });
    return res.send({ location1bets, count });
  } catch (error) {
    return res.status(400).send({
      ...error
    });
  }
};
