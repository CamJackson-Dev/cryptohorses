module.exports = app => {
  const individualplayer = require("../controllers/individualplayer.controller");

  // Get create Individual Player.
  // app.post("/individualplayer", individualplayer.create);

  // Get Individual Player, if not exist and then create Individual Player.
  // app.get("/individualplayer/:playerAddress", individualplayer.findOne);

  // Update Individual Player bets
  // app.put(
  //   "/individualplayer/location1/:playerAddress",
  //   individualplayer.updateLocation1
  // );

  // Get Player Rank by player address.
  app.get("/getLevel/:playerAddress", individualplayer.getPlayerLevel);

  // Get chat sign
  app.get("/isSigned/:playerAddress", individualplayer.getChatSign);

  // Update chat sign
  // app.put("/update/signchat/:id", individualplayer.updateSignchat);

  // get Top 20 playrs
  app.get("/top-players", individualplayer.getTopPlayers);

  // Check Indivudal player exist or not
  app.get("/check/player/:id", individualplayer.findIndividualPlayer);
};
