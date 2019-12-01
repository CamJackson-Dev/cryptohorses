const TronWeb = require("tronweb");
const config = require("../config/config.js");

const fullNode = config.TRONGRID_NODE;
const solidityNode = config.TRONGRID_NODE;
const eventServer = config.TRONGRID_NODE;
const privateKey = config.DUMMY_PK;
console.log('===========================================================')
console.log(config.TRONGRID_NODE)
console.log('===========================================================')

const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);

// Models
const Location1Bets = require("../app/models/location1bets.model");
const MainHouse = require("../app/models/mainhouse.model.js");
const IndividualPlayer = require("../app/models/individualplayer.model");

exports.location1 = async () => {
  try {
    var contractInfo = await tronWeb.trx.getContract(
      config.GAME_LOCATION_1_CONTRACT
    );
    var contractInstance = await tronWeb.contract(
      contractInfo.abi.entrys,
      contractInfo.contract_address
    );
    var counter = 0;
    contractInstance.RaceResult().watch(async (err, event) => {
      console.log("- - - - - - - - -.");
      if (err) return console.error("Error with event:", err);
      if (event) {
        counter++;
        console.log(counter + " event received");
        var playerAddress = tronWeb.address.fromHex(event.result._bettor);

        var predictedHourse = event.result._horseNum;
        var predictedHourseWin = event.result._p1;
        var predictedHoursePlace = event.result._p2;
        var predictedHourseShow = event.result._p3;

        var leaderBoard = new Array();

        leaderBoard.push(
          parseInt("0x" + event.result.leaderBoard.slice(513, 576))
        );
        leaderBoard.push(
          parseInt("0x" + event.result.leaderBoard.slice(577, 640))
        );
        leaderBoard.push(
          parseInt("0x" + event.result.leaderBoard.slice(641, 704))
        );
        leaderBoard.push(
          parseInt("0x" + event.result.leaderBoard.slice(705, 768))
        );
        leaderBoard.push(
          parseInt("0x" + event.result.leaderBoard.slice(769, 832))
        );
        leaderBoard.push(
          parseInt("0x" + event.result.leaderBoard.slice(833, 896))
        );
        leaderBoard.push(
          parseInt("0x" + event.result.leaderBoard.slice(897, 960))
        );
        leaderBoard.push(
          parseInt("0x" + event.result.leaderBoard.slice(961, 1024))
        );

        var winAmount = event.result._winAmount;
        var transactionHash = event.transaction;
        var timestamp = event.timestamp;

        try {
          let orderId = await IndividualPlayer.countDocuments({
            playerAddress
          });

          if (orderId === 0) {
            let individualplayer = new IndividualPlayer({
              playerAddress
            });
            individualplayer = await individualplayer.save();
            // console.log("individualplayer", individualplayer);
          }

          // Update Main House Table
          let mainhouse = await MainHouse.findOne();
          if (!mainhouse) {
            mainhouse = new MainHouse({
              totalWaggeredAmount: 0,
              totalPaidAmount: 0,
              totalNumberOfBet: 0,
              totalDividendPaid: 0,
              dividendPaidLastTime: 0,
              nextDividendDistribution: 0
            });
            mainhouse = await mainhouse.save();
          }
          let paidAmount =
            parseInt(winAmount) -
              parseInt(predictedHourseWin) -
              parseInt(predictedHoursePlace) -
              parseInt(predictedHourseShow) <
            0
              ? 0
              : parseInt(winAmount) -
                parseInt(predictedHourseWin) -
                parseInt(predictedHoursePlace) -
                parseInt(predictedHourseShow);
          mainhouse = await MainHouse.findByIdAndUpdate(
            mainhouse.id,
            {
              totalWaggeredAmount:
                mainhouse.totalWaggeredAmount +
                parseInt(predictedHourseWin) +
                parseInt(predictedHoursePlace) +
                parseInt(predictedHourseShow),
              totalPaidAmount: mainhouse.totalPaidAmount + paidAmount,
              totalNumberOfBet: mainhouse.totalNumberOfBet + 1,
              totalDividendPaid: mainhouse.totalDividendPaid
            },
            { new: true }
          );

          let individualplayer = await IndividualPlayer.findOne({
            playerAddress
          });

          // Create a Location1Bet
          let location1bets = new Location1Bets({
            playerAddress,
            orderId: individualplayer.orderId + 1,
            predictedHorse: [
              {
                horse: predictedHourse,
                win: predictedHourseWin,
                place: predictedHoursePlace,
                show: predictedHourseShow
              }
            ],
            leaderboard: leaderBoard,
            winAmount,
            transactionHash
          });
          location1bets = await location1bets.save();

          let winOrLose =
            parseInt(winAmount) -
            parseInt(predictedHourseWin) -
            parseInt(predictedHoursePlace) -
            parseInt(predictedHourseShow);
          const win = winOrLose > 0 ? winOrLose : 0;
          const lost = winOrLose < 0 ? -winOrLose : 0;

          let updatedIndividualPlayer = await IndividualPlayer.findOneAndUpdate(
            {
              playerAddress
            },
            {
              totalBetAmountAll:
                individualplayer.totalBetAmountAll +
                parseInt(predictedHourseWin) +
                parseInt(predictedHoursePlace) +
                parseInt(predictedHourseShow),
              totalBeAmountLocation1:
                individualplayer.totalBeAmountLocation1 +
                parseInt(predictedHourseWin) +
                parseInt(predictedHoursePlace) +
                parseInt(predictedHourseShow),
              totalBetLocation1: individualplayer.totalBetLocation1 + 1,
              totalWinAmount: individualplayer.totalWinAmount + win,
              totalLoseAmount: individualplayer.totalLoseAmount + lost,
              orderId: individualplayer.orderId + 1
            },
            { new: true }
          );
          // socket.emit("getBets", location1bets);
        } catch (error) {
          console.log("error", error);
        }
      }
    });
  } catch (e) {
    console.log("error", e);
  }
};
