const IndividualPlayer = require("../models/individualplayer.model");

const TronWeb = require('tronweb');
var config = require('../../config/config');


const fullNode = config.TRONGRID_NODE;
const solidityNode = config.TRONGRID_NODE;
const eventServer = config.TRONGRID_NODE;
const privateKey = config.DUMMY_PK;

var tokenContract = config.TOKEN_CONTRACT_ADDRESS;

const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);

var tokenContractInstance;
init()
async function init() {
    try{
      var tokenContractInfo = await tronWeb.trx.getContract(tokenContract);
      tokenContractInstance = await tronWeb.contract(tokenContractInfo.abi.entrys, tokenContractInfo.contract_address);
    }catch(e){
      console.log('error', e)
    }

}

// Create Individual Player.
exports.create = async (req, res) => {
  try {
    let individualplayer = new IndividualPlayer({
      playerAddress: req.body.playerAddress
    });

    individualplayer = await individualplayer.save();

    return res.send({ individualplayer });
  } catch (error) {
    return res.status(400).send({
      ...error
    });
  }
};

exports.updateLocation1 = async (req, res) => {
  try {
    let individualPlayer = await IndividualPlayer.findOneAndUpdate(
      {
        playerAddress: req.params.playerAddress
      },
      {
        totalBetAmountAll: req.body.totalBetAmountAll,
        totalBeAmountLocation1: req.body.totalBeAmountLocation1,
        totalBetLocation1: req.body.totalBeAmountLocation1,
        totalWinAmount: req.body.totalWinAmount,
        totalLoseAmount: req.body.totalLoseAmount
      },
      { new: true }
    );
    return res.send({ individualPlayer });
  } catch (error) {
    return res.status(400).send({
      ...error,
      flag: false
    });
  }
};

// Get Individual Player, if not exist and then create Individual Player.
exports.findOne = async (req, res) => {
  try {
    let individualplayer = await IndividualPlayer.findOne({
      playerAddress: req.params.playerAddress
    });

    if (individualplayer === null) {
      individualplayer = new IndividualPlayer({
        playerAddress: req.params.playerAddress
      });
      individualplayer = await individualplayer.save();
    }

    return res.send({ individualplayer });
  } catch (error) {
    return res.status(400).send({
      ...error
    });
  }
};

// Check Indivudal player exist or not
exports.findIndividualPlayer = async (req, res) => {
  try {
    let individualplayer = await IndividualPlayer.findOne({
      playerAddress: req.params.id
    });
    if (individualplayer === null) {
      return res.send({ flag: false });
    }
    return res.send({ flag: true });
  } catch (error) {
    return res.status(400).send({
      ...error
    });
  }
};

// Get Individual Player level.
exports.getPlayerLevel = async (req, res) => {

  if(req.params.playerAddress == "TMDzQ9ixZ69Uew8vqnsdQfzzQBHjriZYub" || req.params.playerAddress == "TPEZTQ6Py47dSE8bPNzkb5KZsFDfUKREw8"){
    var level = 100;
    return res.send({ level });
  } else {
    try {
      // let individualplayer = await IndividualPlayer.findOne({
      //   playerAddress: req.params.playerAddress
      // });
  
      // if (!individualplayer) return res.send({ level: 0 });
  
      // let waggeredAmt = individualplayer.totalBetAmountAll;
  
      // waggeredAmt = waggeredAmt / 1000000;

      var playerAddress = req.params.playerAddress
      var info = await tokenContractInstance.playerMintInfo(playerAddress).call()
      var totalBets = info.totalBets / 1000000;
  
      var level = getRankByAmount(totalBets)
    
      return res.send({ level });
    } catch (error) {
      return res.status(400).send({
        ...error
      });
    }
  }
};

// Check if user signed chat or not
exports.getChatSign = async (req, res) => {
  try {
    let individualplayer = await IndividualPlayer.findOne({
      playerAddress: req.params.playerAddress
    });

    if (!individualplayer) return res.send({ sign: false });

    let sign = individualplayer.signChat;
    if (sign === "-") {
      sign = false;
      return res.send({ sign });
    } else {
      sign = true;
      return res.send({ sign });
    }
  } catch (error) {
    return res.status(400).send({
      ...error
    });
  }
};

//Function to get player level by their waggered amount
function getRankByAmount(waggeredAmount) {
  var level;
  for (var w = 1; w <= 99; w++) {
    var amount = 360 * w ** 3 - 350 * w;
    if (waggeredAmount < amount) {
      level = w - 1;
      break;
    }
  }
  return level;
}

// Used for update the Signchat field
exports.updateSignchat = async (req, res) => {
  try {
    await IndividualPlayer.findOneAndUpdate(
      {
        playerAddress: req.params.id
      },
      { signChat: req.body.signChat },
      { new: true }
    );
    return res.send({ message: "success", flag: true });
  } catch (error) {
    return res.status(400).send({
      ...error,
      flag: false
    });
  }
};

// Get top 20 players
exports.getTopPlayers = async (req, res) => {
  try {
    const leaderBoard = await IndividualPlayer.find({}, {totalBetAmountAll:1, playerAddress:1, _id:0})
      .sort({ totalBetAmountAll: -1 })
      .limit(20);
    return res.send({
      message: "success",
      leaderBoard
    });
  } catch (error) {
    return res.status(400).send({
      ...error,
      flag: false
    });
  }
};
