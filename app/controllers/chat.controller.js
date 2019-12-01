const Chat = require("../models/chat.model");
const IndividualPlayer = require("../models/individualplayer.model");

// Create and Save a new chat
exports.create = async (req, res) => {
  try {
    const individualplayer = await IndividualPlayer.findOne({
      playerAddress: req.body.userAddress
    });

    if (individualplayer) {
      // Create a Chat
      let chat = new Chat({
        userAddress: req.body.userAddress,
        userName: req.body.userName,
        level: req.body.level,
        message: req.body.message,
        room: req.body.room
      });
  
      chat = await chat.save();
      return res.send({ chat });
    } else {
      return res.status(400).send({
        message: "Please check the useraddress"
      });  
    }

  } catch (error) {
    return res.status(400).send({
      ...error
    });
  }
};

// Retrieve last 50 chats.
exports.findAll = async (req, res) => {
  try {
    let chats = await Chat.find({}, null, {
      limit: 50,
      sort: { createdAt: -1 }
    });
    return res.send({ chats });
  } catch (error) {
    return res.status(400).send({
      ...error
    });
  }
};

// Retrieve last 50 chats filter by room.
exports.findOne = async (req, res) => {
  try {
    let chats = await Chat.find(
      { room: req.params.room },
      { userName: 1, level: 1, message: 1, _id: 0 },
      {
        limit: 50,
        sort: { createdAt: -1 }
      }
    );
    return res.send({ chats });
  } catch (error) {
    return res.status(400).send({
      ...error
    });
  }
};
