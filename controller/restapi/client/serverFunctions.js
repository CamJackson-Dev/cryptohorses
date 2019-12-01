const TronWeb = require('tronweb');
var config = require('../../../config/config');
var cron = require('node-cron');

const fullNode = config.TRONGRID_NODE;
const solidityNode = config.TRONGRID_NODE;
const eventServer = config.TRONGRID_NODE;
const privateKey = config.DUMMY_PK;

var tokenContract = config.TOKEN_CONTRACT_ADDRESS;
var dividendContract = config.DIVIDEND_CONTRACT_ADDRESS;
var gameLocation1Contract = config.GAME_LOCATION_1_CONTRACT;

const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);

var tokenContractInstance, dividendContractInstance, gameLocation1ContractInstance;
init()
async function init() {
    try{
        var tokenContractInfo = await tronWeb.trx.getContract(tokenContract);
        tokenContractInstance = await tronWeb.contract(tokenContractInfo.abi.entrys, tokenContractInfo.contract_address);
    
        var dividendContractInfo = await tronWeb.trx.getContract(dividendContract);
        dividendContractInstance = await tronWeb.contract(dividendContractInfo.abi.entrys, dividendContractInfo.contract_address);
    
        var gameContractInfo = await tronWeb.trx.getContract(gameLocation1Contract);
        gameLocation1ContractInstance = await tronWeb.contract(gameContractInfo.abi.entrys, gameContractInfo.contract_address);
    }catch(e){
        console.log('error', e)
    }

}

cron.schedule('* * * * *', async () => {
    var divContractAddress = await tokenContractInstance.dividendContract().call()
    var base58Converted = tronWeb.address.fromHex(divContractAddress);
    if(base58Converted !== dividendContract){
        console.log('need to change');
        setDivAddress();
    }
});

async function setDivAddress(){

    const fullNode = config.TRONGRID_NODE;
    const solidityNode = config.TRONGRID_NODE;
    const eventServer = config.TRONGRID_NODE;
    const privateKey = config.TOKEN_OWNER;

    const tronWebTemp = new TronWeb(fullNode, solidityNode, eventServer, privateKey);

    try{
        var tokenContractInfo = await tronWebTemp.trx.getContract(tokenContract);
        tokenContractInstance = await tronWebTemp.contract(tokenContractInfo.abi.entrys, tokenContractInfo.contract_address);

        await tokenContractInstance.setDividendContract(dividendContract).send({
            shouldPollResponse: false,
            feeLimit: 1000000
        })
    
    }catch(e){
        console.log('error', e)
    }

}

exports.homeRedirect = function (req,res,next){

    res.render ("index",{req:req,res:res});

}

exports.profile = function (req,res,next){

    res.render ("profile",{req:req,res:res});

}

exports.aboutUs = function (req,res,next){

    res.render ("about-us",{req:req,res:res});

}

exports.hongkong = function (req,res,next){

    res.render ("shatin-hongkong",{req:req,res:res});

}

/** Rendering Game **/

exports.locationHongkong = function (req,res,next){

    res.render ("shatin-hongkong/index",{req:req,res:res});

}

/** Get Mint Data from Smart Contract **/

exports.getMintData = async function (req,res,next){

    try{

        var stage = await tokenContractInstance.stage().call();
        var level = await tokenContractInstance.level().call();
        var mintInfo = await tokenContractInstance.getMintInfoByStageAndLevel(stage, level).call()
        var miningDifficulty = tronWeb.fromSun(mintInfo.difficulty);
        var totalMintLimit = tronWeb.fromSun(mintInfo.totalMintLimit);
        var mintedTillNow = tronWeb.fromSun(mintInfo.mintedTillNow);

        var availableDrop = await dividendContractInstance.availableMainDividendALL().call();
        availableDrop = tronWeb.fromSun(availableDrop[1]);

        var totalFrozenWinna = await dividendContractInstance.totalForzenWinnaAcrossNetwork().call();
        totalFrozenWinna = tronWeb.fromSun(totalFrozenWinna);

        // console.log(miningDifficulty + '\n' +totalMintLimit + '\n' + mintedTillNow)

        let obj = {
            'stage': stage,
            'level': level,
            'miningDifficulty': miningDifficulty/1,
            'totalMintLimit': totalMintLimit/1,
            'mintedTillNow': mintedTillNow/1,
            'availableDrop': availableDrop/1,
            'totalFrozenWinna': totalFrozenWinna/1
        }

        // console.log(obj)

        res.send({
            'msg': 'success',
            'data': obj
        })

    }catch(e){
        console.log(e);
        res.send({
            'msg':'error',
            'data': e
        })
    }
   

}

exports.getPlayerProfile = async function (req,res,next){

    try{

        var playerAddress = req.params.playerAddress
        // console.log(playerAddress)
        var info = await tokenContractInstance.playerMintInfo(playerAddress).call()
        var totalBets = info.totalBets / 1000000;
        var mintedToken = info.totalMintedToken / 1000000;
    
        var level = getRankByAmount(totalBets)
    
        var totalEarning = await dividendContractInstance.totalDividendReceivedIndividual(playerAddress).call();
        totalEarning = totalEarning / 1000000;
        var lastDrop = await dividendContractInstance.previousDivAmountUser(playerAddress).call();
        lastDrop = lastDrop /1000000;
    
        let profileObj = {
            level: level,
            totalBets: parseInt(totalBets),
            totalWinna: mintedToken.toFixed(2),
            comulativeEarning: totalEarning.toFixed(2),
            lastWinDrop: lastDrop.toFixed(2)
        }
        // console.log(profileObj)
        res.send({
            'msg': 'success',
            'data': profileObj
        })
    

    }catch(e){
        console.log(e);
        res.send({
            'msg':'error',
            'data': e
        })
    }

}

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