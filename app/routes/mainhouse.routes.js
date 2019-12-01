module.exports = app => {
  const mainhouse = require("../controllers/mainhouse.controller");

  // Create a new Main House
  // app.post("/mainhouse", mainhouse.create);

  // Get all main houses
  // app.get("/mainhouse", mainhouse.find);

  // Get total won amount
  app.get("/wonAmount", mainhouse.getTotalWonAMount);

  //get next winna drop time for timer
  app.get("/nextDrop", mainhouse.nextWinnaDropTime)

  // Update main houses
  // app.put("/mainhouse", mainhouse.update);
};
