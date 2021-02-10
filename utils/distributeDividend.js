const TronWeb = require('tronweb');
const config = require('../config/config.js');
const { utils } = require('ethers');

const fullNode = config.TRONGRID_NODE;
const solidityNode = config.TRONGRID_NODE;
const eventServer = config.TRONGRID_NODE;
// const privateKey = config.DUMMY_PK;
const privateKey = config.SIGNER_KEY;
const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);

const abiCoder = new utils.AbiCoder();

// Models
const MainHouse = require('../app/models/mainhouse.model.js');
const DividendData = require('../app/models/dividend.model.js');

exports.distributeDividend = async () => {
  try {
    var dividendData = new Array();
    var currentDistrinutionTime = 0;
    var nextDistributionTime = 0;
    var dividendContractInfo = await tronWeb.trx.getContract(
      config.DIVIDEND_CONTRACT_ADDRESS
    );
    dividendContractInstance = await tronWeb.contract(
      dividendContractInfo.abi.entrys,
      dividendContractInfo.contract_address
    );

    var systemHalt = await dividendContractInstance
      .changeDivSystemStatus()
      .send({
        shouldPollResponse: false,
        feeLimit: 100000,
      });
    console.log(systemHalt);
    var responseHalt = await waitForTxConfirmation(systemHalt);
    if (responseHalt) {
      console.log('system halted');
      var totalDistributed = 0;
      var successfulyPaid = 0;

      var distributeTx = await dividendContractInstance
        .distributeDividend()
        .send({
          shouldPollResponse: false,
          feeLimit: 5000000,
        });
      console.log(distributeTx);
      await waitForTxConfirmation(distributeTx);

      var returnData = await decodeResult(distributeTx);

      currentDistrinutionTime = Math.floor(new Date().getTime() / 1000);
      nextDistributionTime = currentDistrinutionTime + 86400;

      var isDividendAvailable = returnData[0];
      var availableDividend = returnData[1].toNumber();
      console.log(isDividendAvailable);
      console.log(availableDividend);

      if (isDividendAvailable) {
        totalDistributed += availableDividend;
        try {
          var totalNumberOfStackers = await dividendContractInstance
            .getMaxStackerIndex()
            .call();
          totalNumberOfStackers = totalNumberOfStackers.toNumber();

          var totalPossibleTransaction = totalNumberOfStackers / 10;
          totalPossibleTransaction = Math.ceil(totalPossibleTransaction);

          console.log(
            'There are ' +
              totalNumberOfStackers +
              ' stackers. Total ' +
              totalPossibleTransaction +
              ' transaction needs to be done.'
          );
          for (var txNo = 1; txNo <= totalPossibleTransaction; txNo++) {
            console.log('for loop: ' + txNo);
            var max;
            if (txNo == totalPossibleTransaction) {
              max = totalNumberOfStackers - 1;
            } else {
              max = txNo * 10 - 1;
            }

            try {
              let objData = {
                transactionId: '',
                txStatus: '',
                min: 0,
                max: 0,
              };

              var min = txNo * 10 - 10;

              var accounts = await dividendContractInstance
                .getLimitedStackers(min, max)
                .call();
              var payDivTX = await dividendContractInstance
                .payDivUser(accounts)
                .send({
                  shouldPollResponse: false,
                });
              console.log(payDivTX);
              await waitForTxConfirmation(payDivTX);
              console.log('confirmed tx of payDivUser');
              var status = await decodeResultPayTX(payDivTX);

              if (status[0] == true) {
                var amtPaid = status[1];
                successfulyPaid += amtPaid;

                objData.transactionId = payDivTX;
                objData.min = min;
                objData.max = max;
                objData.txStatus = 'SUCCESS';
                dividendData.push(objData);
                console.log('tx success');
                console.log(dividendData);
              } else {
                objData.transactionId = payDivTX;
                objData.min = min;
                objData.max = max;
                objData.txStatus = 'REVERT';
                dividendData.push(objData);
                console.log('tx failed');
                console.log(dividendData);
              }
            } catch (errorSendDiv) {
              console.log('errorSendDiv', errorSendDiv);
            }
          }

          try {
            await dividendContractInstance.changeDivSystemStatus().send({
              shouldPollResponse: false,
              feeLimit: 100000,
            });
            console.log('unhalted');
            var divPaidNo = await dividendContractInstance
              .numberOfDividendPaidTillNow()
              .call();
            divPaidNo = divPaidNo.toNumber();
            // Create a dividend data
            let dividendDataDB = new DividendData({
              distributionNumber: divPaidNo,
              totalDistributedAmount: totalDistributed,
              successfullyPaidAmount: successfulyPaid,
              txIdAndStatus: dividendData,
            });
            dividendDataDB = await dividendDataDB.save();
            console.log('dividendDataDB', dividendDataDB);

            // Update Main House Table
            let mainhouse = await MainHouse.findOne();
            if (!mainhouse) {
              mainhouse = new MainHouse({
                totalWaggeredAmount: 0,
                totalPaidAmount: 0,
                totalNumberOfBet: 0,
                totalDividendPaid: 0,
              });
              mainhouse = await mainhouse.save();
            }

            mainhouse = await MainHouse.findByIdAndUpdate(
              mainhouse.id,
              {
                totalDividendPaid:
                  mainhouse.totalDividendPaid + totalDistributed,
                dividendPaidLastTime: currentDistrinutionTime,
                nextDividendDistribution: nextDistributionTime,
              },
              { new: true }
            );
          } catch (errorSavingToDB) {
            console.log('errInDBSaving', errorSavingToDB);
          }
        } catch (errorCall) {
          console.log('errorCall', errorCall);
        }
      } else {
        try {
          await dividendContractInstance.changeDivSystemStatus().send({
            shouldPollResponse: false,
            feeLimit: 100000,
          });

          var divPaidNo = await dividendContractInstance
            .numberOfDividendPaidTillNow()
            .call();
          divPaidNo = divPaidNo.toNumber();
          // Create a dividend data
          let dividendDataDB = new DividendData({
            distributionNumber: divPaidNo,
            totalDistributedAmount: 0,
            successfullyPaidAmount: 0,
          });
          dividendDataDB = await dividendDataDB.save();
          console.log('dividendDataDB', dividendDataDB);

          // Update Main House Table
          let mainhouse = await MainHouse.findOne();
          if (!mainhouse) {
            mainhouse = new MainHouse({
              totalWaggeredAmount: 0,
              totalPaidAmount: 0,
              totalNumberOfBet: 0,
              totalDividendPaid: 0,
            });
            mainhouse = await mainhouse.save();
          }

          mainhouse = await MainHouse.findByIdAndUpdate(
            mainhouse.id,
            {
              dividendPaidLastTime: currentDistrinutionTime,
              nextDividendDistribution: nextDistributionTime,
            },
            { new: true }
          );
        } catch (e) {
          console.log('mainError', e);
        }
      }
    } else {
      console.log('cannot halt while distribution');
    }
  } catch (errorDistribute) {
    console.log('errorDistribute', errorDistribute);
  }
};

function waitForTxConfirmation(txId) {
  return new Promise(function (resolve, reject) {
    var checkTxStatus = setInterval(async function () {
      try {
        var status = await tronWeb.Tron.getTransactionInfo(txId);
        if (status) {
          if (status.receipt.result == 'SUCCESS') {
            clearInterval(checkTxStatus);
            resolve(true);
          } else {
            clearInterval(checkTxStatus);
            resolve(false);
          }
        }
      } catch (error) {
        // console.log(error)
      }
    }, 1000);
  });
}

async function decodeResult(txId) {
  try {
    var status = await tronWeb.Tron.getTransactionInfo(txId);
    if (status.receipt.result == 'SUCCESS') {
      const types = ['bool', 'uint256'];
      var output = '0x' + status.contractResult[0];
      var result = abiCoder.decode(types, output);
      return result;
    } else {
      return [false, 0];
    }
  } catch (e) {
    return [false, 0];
  }
}

async function decodeResultPayTX(txId) {
  try {
    var status = await tronWeb.Tron.getTransactionInfo(txId);
    if (status.receipt.result == 'SUCCESS') {
      var amtPaid = TronWeb.toDecimal('0x' + status.contractResult[0]);
      return [true, amtPaid];
    } else {
      return [false, 0];
    }
  } catch (e) {
    return [false, 0];
  }
}
