module.exports = app => {
  const location1bets = require("../controllers/location1bets.controller");

  // Create a new Location 1 bet
  // app.post("/location1bets", location1bets.create);

  // Get all Location 1 bets
  // app.get("/location1bets", location1bets.find);

  // Get all Location 1 bets of Particular Player
  app.get("/hongkong/:id", location1bets.findByPlayerAddrees);

  // Get all Location 1 bets with filter of Particular Player
  app.get("/hongkong/filter/:id", location1bets.findByPlayerAddreesWithFilter);

};
