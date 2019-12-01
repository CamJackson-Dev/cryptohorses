module.exports = app => {
  const chat = require("../controllers/chat.controller");

  // Create a new Chat
  // app.post("/chat", chat.create);

  // Get all chats
  // app.get("/chat", chat.findAll); 

  // Get specific room chat
  app.get("/chat/:room", chat.findOne);

};
