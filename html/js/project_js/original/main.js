var global = {
  userAddress: '',
  userAddressHex: '',
  TronscanName: '',
  username: '',
  loggedIn: false,
  shortAddress: '',
  level: 0,
  userSigned: false,
};

let allBets = [];
let myBets = [];
let filter = 'all';
let page = 50;
let skip = 0;
let selected = 1;
let count = 0;

const horseNames = [
  'Winnathunder',
  'Trontrot',
  'Troncruise',
  'Spuntino',
  'Blazer',
  'DarkMatter',
  'Mr. Ed',
  'Redhorse',
];

var tokenContract = 'TSr7ULAqrYwxUHDLaZqsudktKcsJW6VKh9';
var dividendContract = 'TUbFTjPcEv2k9iF82E6f3PhWV4cKQ7CjGs';
var gameLocation1Contract = 'TKXAsb3oJwYhCmBjB15wj5tJuLuvJg3aYe';

var TronNode = 'https://api.shasta.TRONGRID.io';
// var TronNode = "https://api.TRONGRID.io"

var tokenContractInstance,
  dividendContractInstance,
  gameLocation1ContractInstance;

$(document).ready(async function () {
  getCurrentLangAndWallet();
  var TronLinkLoginCheck = getCookie('TronLinkLoginTracker');
  if (TronLinkLoginCheck == 1) {
    autoTronLinkloginCheck();
  }
});

// Login & Default Initialization

$('#isLoggedIn').on('click', function () {
  TronLinkloginCheck();
});

function autoTronLinkloginCheck() {
  let counter = 0;
  const maxAttempts = 4;
  window.addEventListener('TronWebInjected', { once: true });
  const intervalId = setInterval(() => {
    const { TronWeb } = window;
    counter++;
    if (counter > maxAttempts) {
      window.removeEventListener('TronWebInjected', { once: true });
      listClick('all');
      return clearInterval(intervalId);
    }
    if (TronWeb) {
      if (TronWeb.ready) {
        initGlobalData();
        console.log(global);
        setCookie('TronLinkLoginTracker', '1', 10);
        clearInterval(intervalId);
        dispatchEvent(new Event('TronWebInjected'));
      }
    }
  }, 1000);
}

async function TronLinkloginCheck() {
  let counter = 0;
  const maxAttempts = 4;
  window.addEventListener('TronWebInjected', { once: true });
  const intervalId = setInterval(() => {
    const { TronWeb } = window;
    counter++;
    if (counter > maxAttempts) {
      $('#login-popup').modal('show');
      window.removeEventListener('TronWebInjected', { once: true });
      listClick('all');
      return clearInterval(intervalId);
    }
    if (TronWeb) {
      if (TronWeb.ready) {
        initGlobalData();
        console.log(global);
        setCookie('TronLinkLoginTracker', '1', 10);
        clearInterval(intervalId);
        dispatchEvent(new Event('TronWebInjected'));
      }
    }
  }, 1000);
}

async function initGlobalData() {
  global.shortAddress = getUserAddress(TronWeb.defaultAddress.base58);
  $('#userAddress').text(global.shortAddress);
  $('#isLoggedIn').hide();

  global.TronscanName = await getTronscanName(TronWeb.defaultAddress.base58);
  global.userAddress = TronWeb.defaultAddress.base58;
  global.userAddressHex = TronWeb.defaultAddress.hex;
  global.loggedIn = true;
  listClick('all');
  let response = null;
  try {
    response = await $.get(`${url}/isSigned/${global.userAddress}`);
  } catch (error) {
    // console.log("error", error);
  }
  // console.log(response);
  global.userSigned = response.sign;
  // console.log(global);
  getPlayerLevel();
  initContractInstance();
  loadMyBetsData();
  liveMyBets();

  try {
    const profileData = await $.get(`${url}/getProfile/${global.userAddress}`);
    console.log(profileData);
    if (profileData.msg == 'success') {
      $('#levelPlayer').text(profileData.data.level);
      $('#totalBets').text(profileData.data.totalBets.toLocaleString('en'));
      $('#totalWinna').text(profileData.data.totalWinna.toLocaleString('en'));
      $('#totalEarning').text(
        profileData.data.comulativeEarning.toLocaleString('en') + ' Tron'
      );
      $('#lastDrop').text(profileData.data.lastWinDrop + ' Tron');
    }

    if (document.getElementById('my-profile-bets-body')) {
      filter = 'all';
      skip = 0;
      selected = 1;
      count = 0;
      let response = await $.get(
        `${url}/hongkong/filter/${global.userAddress}?filter=${filter}&page=${page}&skip=${skip}`
      );
      myBets = response.location1bets;
      count = response.count;
      const options = Math.ceil(parseFloat(count / page));

      $('#skip').children('option').remove();
      for (let i = 1; i <= options; i++) {
        $('#skip').append($('<option></option>').attr('value', i).text(i));
      }

      if (myBets.length !== 0) {
        document.getElementById('my-profile-bets-footer').style.display =
          'none';
      }

      myBets.forEach(
        ({
          leaderboard,
          orderId,
          transactionHash,
          predictedHorse,
          winAmount,
          createdAt,
        }) => {
          const id = 'my-profile-bets';
          var template = jQuery(`#${id}`).html();
          var html = Mustache.render(template, {
            order: orderId,
            hash: transactionHash,
            hashString: transactionHash.slice(0, 13),
            horsePrediction: horseNames[predictedHorse[0]['horse']],
            winningHorse:
              '[ 1st: ' +
              horseNames[leaderboard[0]] +
              ', 2nd: ' +
              horseNames[leaderboard[1]] +
              ', 3rd: ' +
              horseNames[leaderboard[2]] +
              ' ]',
            betAmount:
              (predictedHorse[0]['win'] +
                predictedHorse[0]['place'] +
                predictedHorse[0]['show']) /
              1000000,
            winAmount: winAmount === 0 ? '-' : winAmount / 1000000,
            color: winAmount === 0 ? 'color:#ff5959' : 'color:#01F593',
            createdAt: new Date(createdAt).toLocaleString(),
          });
          jQuery('#my-profile-bets-body').append(html);
        }
      );
    }
  } catch (error) {
    console.error(error);
  }
}

function getUserAddress(userAddress) {
  var firstFive = userAddress.substring(0, 5);
  var lastFive = userAddress.substr(userAddress.length - 5);
  return firstFive + '...' + lastFive;
}

// Setting username with level, leveltag and player username for chat
async function getPlayerLevel() {
  return new Promise(async function (resolve, reject) {
    try {
      const response = await $.get(`${url}/getLevel/${global.userAddress}`);

      global.level = response.level;
      var level = response.level;

      var levelTag;

      if (level == 0) {
        levelTag = 'Visitor';
      } else if (level >= 1 && level <= 5) {
        levelTag = 'Shoveller';
      } else if (level >= 6 && level <= 10) {
        levelTag = 'Float Driver';
      } else if (level >= 11 && level <= 15) {
        levelTag = 'Barrier Attendant';
      } else if (level >= 16 && level <= 20) {
        levelTag = 'StableHand';
      } else if (level >= 21 && level <= 25) {
        levelTag = 'Track Rider';
      } else if (level >= 26 && level <= 30) {
        levelTag = 'Farrier';
      } else if (level >= 31 && level <= 35) {
        levelTag = 'Horse Breaker';
      } else if (level >= 36 && level <= 40) {
        levelTag = 'Strapper';
      } else if (level >= 41 && level <= 45) {
        levelTag = 'Effinex';
      } else if (level >= 46 && level <= 50) {
        levelTag = 'Apprentice';
      } else if (level >= 51 && level <= 55) {
        levelTag = 'Jockey';
      } else if (level >= 56 && level <= 60) {
        levelTag = 'Race Caller';
      } else if (level >= 61 && level <= 65) {
        levelTag = 'Thoroughbred Trainer';
      } else if (level >= 66 && level <= 70) {
        levelTag = 'Steward';
      } else if (level >= 71 && level <= 75) {
        levelTag = 'Bloodstock Agent';
      } else if (level >= 76 && level <= 80) {
        levelTag = 'Pro Syndicator';
      } else if (level >= 81 && level <= 85) {
        levelTag = 'First Dude';
      } else if (level >= 86 && level <= 90) {
        levelTag = 'G3 Owner';
      } else if (level >= 91 && level <= 95) {
        levelTag = 'G2 Owner';
      } else if (level >= 96 && level <= 99) {
        levelTag = 'G1 Owner';
      } else if (level == 100) {
        levelTag = 'WINNA';
      }

      global.username =
        '[ LVL ' + level + ' | ' + levelTag + ' ] ' + global.TronscanName;
      resolve(true);
    } catch (error) {
      console.error(error);
    }
  });
}

function getTronscanName(address) {
  return new Promise(function (resolve, reject) {
    var _returnName = '';
    $.ajax({
      url: 'https://apilist.Tronscan.org/api/account?address=' + address,
      dataType: 'json',
      async: true,
      success: function (data) {
        if (data.name != '') {
          _returnName = data.name;
        } else {
          _returnName = getUserAddress(address);
        }
        console.log(_returnName);
        resolve(_returnName);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        _returnName = getUserAddress(address);
        resolve(_returnName);
      },
    });
  });
}

setTimeout(function () {
  setInterval(updateWonAmont, 5000);
}, 6000);

async function updateWonAmont() {
  try {
    response = await $.get(`${url}/wonAmount`);
    odometer.innerHTML = parseInt(response.totalPaidAmt / 1000000);
  } catch (error) {
    // console.log("error", error);
  }
}

/****************check for address change in Tronlink --START*************************/
//Try to set handle address change event
let intervalID = setInterval(async function () {
  if (typeof window.TronWeb == 'object') {
    // window.TronWeb.on("addressChanged", initGlobalData);
    try {
      var userAddress = await window.TronWeb.defaultAddress.base58;
      var userAddressHex = await window.TronWeb.defaultAddress.hex;
      if (global.userAddress == '' && userAddress != '') {
        // initGlobalData()
      }
      if (global.userAddress != '' && global.userAddress != userAddress) {
        global.userAddress = userAddress;
        global.userAddressHex = userAddressHex;
        clearInterval(intervalID);
        location.reload();
      }
    } catch (e) {}
  }
}, 1000);

/****************check for address change in Tronlink --END*************************/
/**************** Detect and set current language and wallet --START*************************/

$('.walletDropDown').on('click', function () {
  var wallet = $(this).attr('name');
  if (wallet == 'guild-wallet') {
    setCookie('wallet', wallet, 5);
    $('#currWallet').html('<img src="images/' + wallet + '.png">Guild Wallet');
  } else {
    setCookie('wallet', wallet, 5);
    $('#currWallet').html('<img src="images/' + wallet + '.png">TronLink');
  }
});

$('.languageDropDown').on('click', function () {
  var lang = $(this).attr('name');
  // console.log(lang);
  setCookie('language', lang, 30);
  location.reload();
  $('#currLang').text($(this).text());
});

function getCurrentLangAndWallet() {
  var lang = getCookie('language');
  if (lang == 'ru') {
    $('#currLang').text('Pусский');
  } else if (lang == 'de') {
    $('#currLang').text('Deutsch');
  } else if (lang == 'zh-CN') {
    $('#currLang').text('简体中文');
  } else if (lang == 'kr') {
    $('#currLang').text('한국어');
  } else if (lang == 'es') {
    $('#currLang').text('Español');
  } else if (lang == 'po') {
    $('#currLang').text('Português');
  } else if (lang == 'fr') {
    $('#currLang').text('Français');
  } else {
    setCookie('language', 'en', 5);
    $('#currLang').text('English');
  }

  var wallet = getCookie('wallet');
  if (wallet == 'guild-wallet') {
    $('#currWallet').html('<img src="images/' + wallet + '.png">Guild Wallet');
  } else {
    setCookie('wallet', 'Tronlink', 5);
    $('#currWallet').html('<img src="images/Tronlink.png">TronLink');
  }
}

/**************** Detect and set current language and wallet --END*************************/

// Function to set and get cookie

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = 'expires=' + d.toGMTString();
  document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

function getCookie(cname) {
  var name = cname + '=';
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

/**************** Function to update dividend panel data --START*************************/
nextDropTimer();

async function nextDropTimer() {
  var res = await $.get(`${url}/nextDrop`);
  console.log(res.nextWinnaDrop);

  var registrationStart = new Date(res.nextWinnaDrop * 1000);
  var countDownDate = new Date(registrationStart).getTime();
  var x = setInterval(function () {
    var hours, minutes, seconds;

    var now = new Date().getTime();

    var distance = countDownDate - now;
    hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    seconds = Math.floor((distance % (1000 * 60)) / 1000);
    // console.log(hours + ':' + minutes + ':' + seconds);

    $('#nextWinnaDrop').text(hours + ':' + minutes + ':' + seconds);
    if (distance < 0) {
      clearInterval(x);
      $('#nextWinnaDrop').text('Distributing dividends...');
    }
  }, 1000);
}

setInterval(updateMintInfo, 4000);
async function updateMintInfo() {
  if (TronWeb && TronWeb.ready && TronWeb.eventServer.host.includes(TronNode)) {
    try {
      var stage = await tokenContractInstance.stage().call();
      var level = await tokenContractInstance.level().call();
      var mintInfo = await tokenContractInstance
        .getMintInfoByStageAndLevel(stage, level)
        .call();
      var availableDrop = await dividendContractInstance
        .availableMainDividendALL()
        .call();
      var totalFrozenWinna = await dividendContractInstance
        .totalForzenWinnaAcrossNetwork()
        .call();
      var availDivPlayer = await dividendContractInstance
        .availableDividendIndividualLive(global.userAddress)
        .call();

      var miningDifficulty = TronWeb.fromSun(mintInfo.difficulty);
      var totalMintLimit = TronWeb.fromSun(mintInfo.totalMintLimit);
      var mintedTillNow = TronWeb.fromSun(mintInfo.mintedTillNow);

      var availableTronDrop = TronWeb.fromSun(availableDrop[1]);
      if (availableDrop[0] || availableTronDrop == 0) {
        $('#availableWinnaDrop').text(
          parseFloat(availableTronDrop).toFixed(2).toLocaleString('en') +
            ' Tron'
        );
      } else {
        $('#availableWinnaDrop').text(
          '-' +
            parseFloat(availableTronDrop).toFixed(2).toLocaleString('en') +
            ' Tron'
        );
      }

      totalFrozenWinna = TronWeb.fromSun(totalFrozenWinna);
      $('#totalFrozenWinna').text(
        parseFloat(totalFrozenWinna).toFixed(2).toLocaleString('en') + ' WINNA'
      );

      availDivPlayer = TronWeb.fromSun(availDivPlayer);
      $('#playerDividend').text(
        parseFloat(availDivPlayer).toFixed(2).toLocaleString('en') + ' Tron'
      );

      $('#stage').text(stage);
      $('#level').text(level);
      $('#difficulty').text(miningDifficulty + ' Tron');
      $('#mintedtillNow').text(
        parseFloat(mintedTillNow).toFixed(2).toLocaleString('en')
      );
      $('#mintLimit').text(parseFloat(totalMintLimit).toLocaleString('en'));

      var percentage = (mintedTillNow / totalMintLimit) * 100 + '%';

      $('#progressBar').css({ width: percentage });
    } catch (error) {
      console.log('error', error);
    }
  } else {
    try {
      const res = await $.get(`${url}/getMintData`);
      // console.log(res.data)
      $('#stage').text(res.data.stage);
      $('#level').text(res.data.level);
      $('#difficulty').text(res.data.miningDifficulty + ' Tron');
      $('#mintedtillNow').text(
        parseFloat(res.data.mintedTillNow).toFixed(2).toLocaleString('en')
      );
      $('#mintLimit').text(
        parseFloat(res.data.totalMintLimit).toLocaleString('en')
      );

      $('#availableWinnaDrop').text(
        parseFloat(res.data.availableDrop).toFixed(2).toLocaleString('en') +
          ' Tron'
      );
      $('#totalFrozenWinna').text(
        parseFloat(res.data.totalFrozenWinna).toFixed(2).toLocaleString('en') +
          ' WINNA'
      );
      $('#playerDividend').text('0.00 Tron');

      var percentage =
        (res.data.mintedTillNow / res.data.totalMintLimit) * 100 + '%';

      $('#progressBar').css({ width: percentage });
    } catch (error) {
      // console.log("error", error);
      $('#totalFrozenWinna').text('0 Tron');
      $('#availableWinnaDrop').text('0 Tron');
      $('#playerDividend').text('0.00 Tron');
    }
  }
}
var globalInfo = {
  winnaBalance: 0,
  frozenWinna: 0,
  pendingWithdraw: 0,
  withdrawTime: 0,
  systemHalt: false,
};
setTimeout(function () {
  setInterval(updateWinnaInfo, 1000);
}, 3000);
async function updateWinnaInfo() {
  if (TronWeb && TronWeb.ready && TronWeb.eventServer.host.includes(TronNode)) {
    try {
      var balance = await tokenContractInstance
        .balanceOf(global.userAddress)
        .call();
      var playerStackInfo = await dividendContractInstance
        .playerStackInfoByAddress(global.userAddress)
        .call();
      var systemHalt = await dividendContractInstance
        .dividendSystemHalt()
        .call();

      globalInfo.winnaBalance = balance.toNumber().toFixed(2) / 1000000;

      balance =
        balance.toNumber() > 0
          ? balance.toNumber().toFixed(2) / 1000000 + ' WINNA'
          : '0 WINNA';
      var playerFrozenWinna =
        playerStackInfo.frozenWinna.toNumber() > 0
          ? playerStackInfo.frozenWinna.toNumber().toFixed(2) / 1000000 +
            ' WINNA'
          : '0 WINNA';
      var playerPendingWithdraw =
        playerStackInfo.pendingWithdraw.toNumber() > 0
          ? playerStackInfo.pendingWithdraw.toNumber().toFixed(2) / 1000000 +
            ' WINNA'
          : '0 WINNA';
      var pendingWithdrawTime = playerStackInfo.withdrawTime.toNumber();

      // globalInfo.winnaBalance = (balance.toNumber()).toFixed(2) / 1000000;
      globalInfo.frozenWinna =
        playerStackInfo.frozenWinna.toNumber().toFixed(2) / 1000000;
      globalInfo.pendingWithdraw =
        playerStackInfo.pendingWithdraw.toNumber().toFixed(2) / 1000000;
      globalInfo.withdrawTime = playerStackInfo.withdrawTime.toNumber();
      globalInfo.systemHalt = systemHalt;
      // console.log(globalInfo)

      if (globalInfo.withdrawTime != 0) {
        $('#claim').attr('disabled', false);
        var registrationStart = new Date(globalInfo.withdrawTime * 1000);
        var countDownDate = new Date(registrationStart).getTime();
        var unfreezeDate = new Date(registrationStart).toLocaleString();

        $('#unfreezeDate').text(unfreezeDate);

        var hours, minutes, seconds;

        var now = new Date().getTime();

        var distance = countDownDate - now;
        hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        seconds = Math.floor((distance % (1000 * 60)) / 1000);
        // console.log(hours + ':' + minutes + ':' + seconds);

        $('#clock').text(hours + ':' + minutes + ':' + seconds);
        $('#claimOrCancle').text('Cancle Unfreeze');
        if (distance < 0) {
          // clearInterval(x);
          $('#claimOrCancle').text('Claim WINNA');
          // console.log("Registration has started.");
        }
        // }, 1000)
      } else {
        $('#claim').attr('disabled', true);
        // clearInterval(x);
      }

      $('#availableWinna').val(globalInfo.winnaBalance + ' WINNA');
      $('#frozenWinna').val(globalInfo.frozenWinna + ' WINNA');
      $('#unfreezeAmt').val(globalInfo.pendingWithdraw + ' WINNA');

      //Freeze popup
      $('#freezableWinna').text(globalInfo.winnaBalance + ' WINNA');
      $('#unfreezableWinna').text(globalInfo.frozenWinna + ' WINNA');
      $('#pendingFreezeeWinna').text(globalInfo.pendingWithdraw + ' WINNA');
    } catch (e) {
      console.log(e);
      $('#availableWinna').val('0 WINNA');
      $('#frozenWinna').val('0 WINNA');
      $('#unfreezeAmt').val('0 WINNA');
    }
  } else {
    $('#availableWinna').val('0 WINNA');
    $('#frozenWinna').val('0 WINNA');
    $('#unfreezeAmt').val('0 WINNA');
  }
}

$('#freezableWinna').on('click', function () {
  $('#frzAmt').val(globalInfo.winnaBalance);
});

$('#unfreezableWinna').on('click', function () {
  $('#unfrzAmt').val(globalInfo.frozenWinna);
});
$('#freeze').on('click', async function () {
  console.log(TronWeb.eventServer.host);
  if (TronWeb && TronWeb.ready && TronWeb.eventServer.host.includes(TronNode)) {
    try {
      var systemHalt = await dividendContractInstance
        .dividendSystemHalt()
        .call();
      if (systemHalt == true) {
        return alert(
          'We are distributing dividend now. All Functionality is not accesable at the moment'
        );
      } else {
        $('#freezeWinnaModal').modal('show');
      }
    } catch (e) {
      //error
    }
  } else {
    $('#login-popup').modal('show');
  }
});

$('#frzAmt').on('keyup', function () {
  var inputVal = $('#frzAmt').val();
  if (!isNaN(inputVal)) {
    if (globalInfo.winnaBalance == 0) {
      $('#frzAmt').val(0);
    } else if (inputVal > globalInfo.winnaBalance) {
      $('#frzAmt').val(globalInfo.winnaBalance);
    }
  } else {
    $('#frzAmt').val(0);
  }
});

$('#freezeConfirm').on('click', async function () {
  if (TronWeb && TronWeb.ready && TronWeb.eventServer.host.includes(TronNode)) {
    var amt = $('#frzAmt').val();
    if (amt != '' && amt >= 1) {
      amt = TronWeb.toSun(amt);
      try {
        var frzTx = await tokenContractInstance.approveAndFreeze(amt).send({
          shouldPollResponse: true,
          feeLimit: 1000000,
        });
        alert('Successfully Frozen WINNA');
        $('#freezeWinnaModal').modal('hide');
      } catch (error) {
        console.log('error', error);
      }
    }
  } else {
    $('#login-popup').modal('show');
  }
});

$('#unfreeze').on('click', async function () {
  if (TronWeb && TronWeb.ready && TronWeb.eventServer.host.includes(TronNode)) {
    try {
      var systemHalt = await dividendContractInstance
        .dividendSystemHalt()
        .call();
      var playerStackInfo = await dividendContractInstance
        .playerStackInfoByAddress(global.userAddress)
        .call();
      var pendingWithdraw =
        playerStackInfo.pendingWithdraw.toNumber().toFixed(2) / 1000000;
      if (systemHalt == true) {
        return alert(
          'We are distributing dividend now. All Functionality is not accesable at the moment'
        );
      } else if (pendingWithdraw != 0) {
        return alert(
          'You have already pending frozen winna. You can unfreeze after claiming that or cancle that unfreeze process'
        );
      } else {
        $('#unfreezeWinnaModal').modal('show');
      }
    } catch (e) {
      console.log(e);
    }
  } else {
    $('#login-popup').modal('show');
  }
});

$('#unfrzAmt').on('keyup', function () {
  var inputVal = $('#unfrzAmt').val();
  if (!isNaN(inputVal)) {
    if (globalInfo.frozenWinna == 0) {
      $('#unfrzAmt').val(0);
    } else if (inputVal > globalInfo.frozenWinna) {
      $('#unfrzAmt').val(globalInfo.frozenWinna);
    }
  } else {
    $('#unfrzAmt').val(0);
  }
});

$('#unfreezeConfirm').on('click', async function () {
  if (TronWeb && TronWeb.ready && TronWeb.eventServer.host.includes(TronNode)) {
    var amt = $('#unfrzAmt').val();
    if (amt != '' && amt >= 1) {
      amt = TronWeb.toSun(amt);

      try {
        var unfrzTx = await dividendContractInstance.Unfreeze(amt).send({
          shouldPollResponse: true,
          feeLimit: 1000000,
        });
        $('#unfreezeWinnaModal').modal('hide');
        alert('Successfully Unfrozen WINNA');
      } catch (error) {
        console.log('error', error);
      }
    }
  } else {
    $('#login-popup').modal('show');
  }
});

$('#claim').on('click', function () {
  if (TronWeb && TronWeb.ready && TronWeb.eventServer.host.includes(TronNode)) {
    $('#claimWinnaModal').modal('show');
  } else {
    $('#login-popup').modal('show');
  }
});

$('#claimOrCancle').on('click', async function () {
  // console.log('clicked')
  if (TronWeb && TronWeb.ready && TronWeb.eventServer.host.includes(TronNode)) {
    try {
      var playerStackInfo = await dividendContractInstance
        .playerStackInfoByAddress(global.userAddress)
        .call();
      var unfreezeTimestamp = playerStackInfo.withdrawTime.toNumber();
      var currentTimestamp = parseInt(Date.now() / 1000);
      if (unfreezeTimestamp < currentTimestamp && unfreezeTimestamp != 0) {
        try {
          var claimTx = await dividendContractInstance.ClaimWinna().send({
            shouldPollResponse: true,
            feeLimit: 1000000,
          });
          $('#claimWinnaModal').modal('hide');
          alert('Successfully Claimed WINNA. It is credited to your account.');
        } catch (error) {
          console.log(error);
          console.log('error', error);
        }
      } else if (
        unfreezeTimestamp > currentTimestamp &&
        unfreezeTimestamp != 0
      ) {
        try {
          var claimTx = await dividendContractInstance.CancleUnfreeze().send({
            shouldPollResponse: true,
            feeLimit: 1000000,
          });
          $('#claimWinnaModal').modal('hide');
          alert('WINNA unfrozen process cancled');
        } catch (error) {
          console.log(error);
          console.log('error', error);
        }
      } else {
        $('#login-popup').modal('show');
      }
    } catch (e) {
      //error
    }
  }
});
async function initContractInstance() {
  if (TronWeb && TronWeb.ready && TronWeb.eventServer.host.includes(TronNode)) {
    try {
      var tokenContractInfo = await tronWeb.trx.getContract(tokenContract);
      tokenContractInstance = await tronWeb.contract(
        tokenContractInfo.abi.entrys,
        tokenContractInfo.contract_address
      );

      var dividendContractInfo = await tronWeb.trx.getContract(
        dividendContract
      );
      dividendContractInstance = await tronWeb.contract(
        dividendContractInfo.abi.entrys,
        dividendContractInfo.contract_address
      );

      var gameContractInfo = await tronWeb.trx.getContract(
        gameLocation1Contract
      );
      gameLocation1ContractInstance = await tronWeb.contract(
        gameContractInfo.abi.entrys,
        gameContractInfo.contract_address
      );
      // updateWinnaInfo()
    } catch (error) {
      console.log('error', error);
    }
  }
}

/**************** Function to update dividend panel data --END*************************/

/******************************** chat box code --START********************************/

let roomName = '';
var socket = io();
// scroll to bottom
function scrollToBottom() {
  var messages = jQuery('#messages');
  var scrollHeight = messages.prop('scrollHeight');
  messages.scrollTop(scrollHeight);
}

$('.changeChatRoom').on('click', function () {
  var room = $(this).attr('name');
  listClick(room);
});

function listClick(room) {
  roomName = room;
  $('#messages').empty();
  socket.emit('join', {
    room: room,
    username: global.username,
    address: global.userAddress,
  });
}

// Socket Code

function getUserameClass(lvl) {
  if (lvl >= 1 && lvl <= 24) {
    return 'usernames1';
  } else if (lvl >= 25 && lvl <= 49) {
    return 'usernames2';
  } else if (lvl >= 50 && lvl <= 74) {
    return 'usernames3';
  } else if (lvl >= 75 && lvl <= 98) {
    return 'usernames4';
  } else if (lvl == 99) {
    return 'usernames5';
  }
}

socket.on('connect', function () {
  // console.log("user connected");
});

socket.on('disconnect', function () {
  // console.log("Disconnected from server");
});

socket.on('getMessage', async ({ address }) => {
  try {
    const response = await $.get(`${url}/chat/${roomName}`);
    console.log(response);
    response.chats.forEach(({ userName, userAddress, message, level }) => {
      const id =
        address === userAddress
          ? 'message-template-sender'
          : 'message-template-receiver';
      var template = jQuery(`#${id}`).html();
      var color = getUserameClass(level);
      var html = Mustache.render(template, {
        color,
        userName,
        message,
        image: '1',
      });
      jQuery('#messages').prepend(html);
    });
    scrollToBottom();
  } catch (error) {
    // console.error(error);
  }
});

socket.on('newMessage', function ({ userName, message, level }) {
  console.log(level);
  const id =
    userName === global.username
      ? 'message-template-sender'
      : 'message-template-receiver';
  var template = jQuery(`#${id}`).html();
  var color = getUserameClass(level);
  var html = Mustache.render(template, {
    color,
    userName,
    message,
    image: '1',
  });
  jQuery('#messages').append(html);
  scrollToBottom();
});

// Get message from All group textarea

jQuery('#all-chats-form').on('submit', async (e) => {
  e.preventDefault();
  if (global.userSigned == false) {
    let playerExist = false;
    try {
      const res = await $.get(`${url}/check/player/${global.userAddress}`);
      playerExist = res.flag;
    } catch (error) {
      // console.log("error", error);
    }
    if (!playerExist) {
      jQuery('[name=all-message]').val('');
      return alert(
        'You need to have level 1 to get chat access. For that you need to wagger 10 Tron'
      );
    }

    var hex = TronWeb.toHex('CryptoHorseRacing.com');
    hex = hex.substring(2);
    try {
      var signed = await tronWeb.Tron.sign(hex);
      console.log(signed);
      if (signed != '') {
        try {
          await $.ajax({
            url: `${url}/update/signchat/${global.userAddress}`,
            type: 'PUT',
            data: { signChat: signed },
            success: function (result) {
              // console.log(result)
              global.userSigned = true;
              $('#sendMsg').trigger('click');
            },
          });
        } catch (error) {
          console.log('error', error);
        }
      }
    } catch (e) {
      //error
    }
  } else {
    try {
      await getPlayerLevel();

      var messageTextbox = jQuery('[name=all-message]');
      const data = {
        userAddress: global.userAddress,
        userName: global.username,
        level: global.level,
        message: messageTextbox.val(),
        room: roomName,
      };
      // const response = await $.post(`${url}/chat`, data);
      // console.log(response);
      socket.emit(
        'createMessage',
        {
          userName: response.chat.userName,
          message: response.chat.message,
          room: response.chat.room,
          level: response.chat.level,
        },
        function () {
          messageTextbox.val('');
        }
      );
    } catch (error) {
      if (error.responseText.includes('is less than minimum allowed value')) {
        alert('You need to have minimum Level 5 to get Chat access');
      }
      // console.error(error);
    }
  }
});

// Press Enter Submit form
$('.textarea-chat-inputfield').keypress(function (e) {
  if (e.which == 13) {
    $('form#all-chats-form').submit();
    return false; //<---- Add this line
  }
});

async function loadMyBetsData() {
  var horseNames = [
    'Winnathunder',
    'Trontrot',
    'Troncruise',
    'Spuntino',
    'Blazer',
    'DarkMatter',
    'Mr. Ed',
    'Redhorse',
  ];
  try {
    let response = await $.get(`${url}/hongkong/${global.userAddress}`);
    // console.log(response);

    myBets = response.location1bets;
    response.location1bets.forEach((data) => {
      // console.log(data)

      var playerAddress =
        data.playerAddress.substring(0, 5) +
        '...' +
        data.playerAddress.substr(data.playerAddress.length - 5);
      var predictedH = horseNames[data.predictedHorse[0].horse];
      var result =
        '[ 1st: ' +
        horseNames[data.leaderboard[0]] +
        ', 2nd: ' +
        horseNames[data.leaderboard[1]] +
        ', 3rd: ' +
        horseNames[data.leaderboard[2]] +
        ' ]';
      var betAmt =
        (data.predictedHorse[0].win +
          data.predictedHorse[0].place +
          data.predictedHorse[0].show) /
        1000000;

      if (data.winAmount === 0) {
        bTrontml =
          '<tr>' +
          '<td>' +
          playerAddress +
          '</td>' +
          '<td>' +
          predictedH +
          '</td>' +
          '<td style="color:#ff5959">' +
          result +
          '</td>' +
          '<td>' +
          betAmt +
          ' Tron</td>' +
          '<td style="color:#ff5959">-</td>' +
          '</tr>';
      } else {
        bTrontml =
          '<tr>' +
          '<td>' +
          playerAddress +
          '</td>' +
          '<td>' +
          predictedH +
          '</td>' +
          '<td style="color:#01F593">' +
          result +
          '</td>' +
          '<td>' +
          betAmt +
          ' Tron</td>' +
          '<td style="color:#01F593">' +
          data.winAmount / 1000000 +
          ' Tron</td>' +
          '</tr>';
      }
      $('#my-bets-body').append(bTrontml);
    });
  } catch (e) {}
}

async function liveMyBets() {
  if (TronWeb && TronWeb.ready && TronWeb.eventServer.host.includes(TronNode)) {
    var horseNames = [
      'Winnathunder',
      'Trontrot',
      'Troncruise',
      'Spuntino',
      'Blazer',
      'DarkMatter',
      'Mr. Ed',
      'Redhorse',
    ];
    try {
      var contractInfo = await tronWeb.trx.getContract(gameLocation1Contract);
      var contractInstance = await tronWeb.contract(
        contractInfo.abi.entrys,
        contractInfo.contract_address
      );
      contractInstance
        .RaceResult()
        .watch({ filter: { _bettor: global.userAddressHex } }, (err, event) => {
          console.log('listining event main.js');
          console.log(event);
          var playerAddress = TronWeb.address.fromHex(event.result._bettor);
          var firstFive = playerAddress.substring(0, 5);
          var lastFive = playerAddress.substr(playerAddress.length - 5);
          playerAddress = firstFive + '...' + lastFive;

          var predictedHourse = event.result._horseNum;
          var predictedHourseWin = event.result._p1;
          var predictedHoursePlace = event.result._p2;
          var predictedHourseShow = event.result._p3;

          var result =
            '[ 1st: ' +
            horseNames[
              parseInt('0x' + event.result.leaderBoard.slice(513, 576))
            ] +
            ', 2nd: ' +
            horseNames[
              parseInt('0x' + event.result.leaderBoard.slice(577, 640))
            ] +
            ', 3rd: ' +
            horseNames[
              parseInt('0x' + event.result.leaderBoard.slice(641, 704))
            ] +
            ' ]';

          var winAmount = parseInt(event.result._winAmount) / 1000000;
          var betAmount =
            (parseInt(predictedHourseWin) +
              parseInt(predictedHoursePlace) +
              parseInt(predictedHourseShow)) /
            1000000;

          var bTrontml;
          if (winAmount === 0) {
            bTrontml =
              '<tr>' +
              '<td>' +
              playerAddress +
              '</td>' +
              '<td>' +
              horseNames[predictedHourse] +
              '</td>' +
              '<td style="color:#ff5959">' +
              result +
              '</td>' +
              '<td>' +
              betAmount +
              ' Tron</td>' +
              '<td style="color:#ff5959">-</td>' +
              '</tr>';
          } else {
            bTrontml =
              '<tr>' +
              '<td>' +
              playerAddress +
              '</td>' +
              '<td>' +
              horseNames[predictedHourse] +
              '</td>' +
              '<td style="color:#01F593">' +
              result +
              '</td>' +
              '<td>' +
              betAmount +
              ' Tron</td>' +
              '<td style="color:#01F593">' +
              winAmount +
              ' Tron</td>' +
              '</tr>';
          }
          console.log(bTrontml);
          setTimeout(function () {
            $('#my-bets-body').prepend(bTrontml);
          }, 33000);
        });
    } catch (e) {
      console.log(e);
    }
  } else {
    // $("#login-popup").modal("show");
  }
}

const locationChange = () => {
  const value = document.getElementById('location').value;
};

const filterChange = async () => {
  $('#my-profile-bets-body').empty();
  let selectValue = document.getElementById('filter').value;
  filter = selectValue;
  skip = 0;
  selected = 1;
  count = 0;

  let response = await $.get(
    `${url}/hongkong/filter/${global.userAddress}?filter=${filter}&page=${page}&skip=${skip}`
  );
  console.log('response', response);
  myBets = response.location1bets;
  count = response.count;

  const options = Math.ceil(parseFloat(count / page));
  $('#skip').children('option').remove();
  for (let i = 1; i <= options; i++) {
    $('#skip').append($('<option></option>').attr('value', i).text(i));
  }

  if (myBets.length === 0)
    document.getElementById('my-profile-bets-footer').style.display =
      'table-footer-group';
  else document.getElementById('my-profile-bets-footer').style.display = 'none';

  myBets.forEach(
    ({
      leaderboard,
      orderId,
      transactionHash,
      predictedHorse,
      winAmount,
      createdAt,
    }) => {
      const id = 'my-profile-bets';
      var template = jQuery(`#${id}`).html();
      var html = Mustache.render(template, {
        order: orderId,
        hash: transactionHash,
        hashString: transactionHash.slice(0, 13),
        horsePrediction: horseNames[predictedHorse[0]['horse']],
        winningHorse:
          '[ 1st: ' +
          horseNames[leaderboard[0]] +
          ', 2nd: ' +
          horseNames[leaderboard[1]] +
          ', 3rd: ' +
          horseNames[leaderboard[2]] +
          ' ]',
        betAmount:
          (predictedHorse[0]['win'] +
            predictedHorse[0]['place'] +
            predictedHorse[0]['show']) /
          1000000,
        winAmount: winAmount === 0 ? '-' : winAmount / 1000000,
        color: winAmount === 0 ? 'color:#ff5959' : 'color:#01F593',
        createdAt: new Date(createdAt).toLocaleString(),
      });
      jQuery('#my-profile-bets-body').append(html);
    }
  );
};

const pageChange = async () => {
  $('#my-profile-bets-body').empty();
  let selectValue = document.getElementById('page').value;
  page = parseInt(selectValue);
  skip = 0;
  selected = 1;
  count = 0;

  let response = await $.get(
    `${url}/hongkong/filter/${global.userAddress}?filter=${filter}&page=${page}&skip=${skip}`
  );
  myBets = response.location1bets;
  count = response.count;

  const options = Math.ceil(parseFloat(count / page));
  $('#skip').children('option').remove();
  for (let i = 1; i <= options; i++) {
    $('#skip').append($('<option></option>').attr('value', i).text(i));
  }

  if (myBets.length === 0)
    document.getElementById('my-profile-bets-footer').style.display =
      'table-footer-group';
  else document.getElementById('my-profile-bets-footer').style.display = 'none';

  myBets.forEach(
    ({
      leaderboard,
      orderId,
      transactionHash,
      predictedHorse,
      winAmount,
      createdAt,
    }) => {
      const id = 'my-profile-bets';
      var template = jQuery(`#${id}`).html();
      var html = Mustache.render(template, {
        order: orderId,
        hash: transactionHash,
        hashString: transactionHash.slice(0, 13),
        horsePrediction: horseNames[predictedHorse[0]['horse']],
        winningHorse:
          '[ 1st: ' +
          horseNames[leaderboard[0]] +
          ', 2nd: ' +
          horseNames[leaderboard[1]] +
          ', 3rd: ' +
          horseNames[leaderboard[2]] +
          ' ]',
        betAmount:
          (predictedHorse[0]['win'] +
            predictedHorse[0]['place'] +
            predictedHorse[0]['show']) /
          1000000,
        winAmount: winAmount === 0 ? '-' : winAmount / 1000000,
        color: winAmount === 0 ? 'color:#ff5959' : 'color:#01F593',
        createdAt: new Date(createdAt).toLocaleString(),
      });
      jQuery('#my-profile-bets-body').append(html);
    }
  );
};

const skipChange = async () => {
  $('#my-profile-bets-body').empty();
  let selectValue = document.getElementById('skip').value;
  skip = parseInt(selectValue) - 1;
  selected = skip + 1;

  let response = await $.get(
    `${url}/hongkong/filter/${global.userAddress}?filter=${filter}&page=${page}&skip=${skip}`
  );
  myBets = response.location1bets;
  count = response.count;

  $('#skip select').val(selected);

  if (myBets.length === 0)
    document.getElementById('my-profile-bets-footer').style.display =
      'table-footer-group';
  else document.getElementById('my-profile-bets-footer').style.display = 'none';

  myBets.forEach(
    ({
      leaderboard,
      orderId,
      transactionHash,
      predictedHorse,
      winAmount,
      createdAt,
    }) => {
      const id = 'my-profile-bets';
      var template = jQuery(`#${id}`).html();
      var html = Mustache.render(template, {
        order: orderId,
        hash: transactionHash,
        hashString: transactionHash.slice(0, 13),
        horsePrediction: horseNames[predictedHorse[0]['horse']],
        winningHorse:
          '[ 1st: ' +
          horseNames[leaderboard[0]] +
          ', 2nd: ' +
          horseNames[leaderboard[1]] +
          ', 3rd: ' +
          horseNames[leaderboard[2]] +
          ' ]',
        betAmount:
          (predictedHorse[0]['win'] +
            predictedHorse[0]['place'] +
            predictedHorse[0]['show']) /
          1000000,
        winAmount: winAmount === 0 ? '-' : winAmount / 1000000,
        color: winAmount === 0 ? 'color:#ff5959' : 'color:#01F593',
        createdAt: new Date(createdAt).toLocaleString(),
      });
      jQuery('#my-profile-bets-body').append(html);
    }
  );
};

const handleLeaderboard = async () => {
  let response = await $.get(`${url}/top-players`);
  console.log(response);
  $('#leaderboard-bets-body').empty();
  response.leaderBoard.forEach(
    ({ playerAddress, totalBetAmountAll }, index) => {
      var addr = getUserAddress(playerAddress);
      let html = '';
      if (index === 0)
        html = `
        <tr>
          <td>
            <span><img src="images/first-rank.png"/></span>
            <img src="images/chat-logotest.png" />
          </td>
          <td>${addr}</td>
          <td>${totalBetAmountAll / 1000000} Tron</td>
        </tr>
      `;
      else if (index === 1)
        html = `
        <tr>
          <td>
            <span><img src="images/second-rank.png"/></span>
            <img src="images/chat-logotest.png" />
          </td>
          <td>${addr}</td>
          <td>${totalBetAmountAll / 1000000} Tron</td>
        </tr>
      `;
      else if (index === 2)
        html = `
        <tr>
          <td>
            <span><img src="images/third-rank.png"/></span>
            <img src="images/chat-logotest.png" />
          </td>
          <td>${addr}</td>
          <td>${totalBetAmountAll / 1000000} Tron</td>
        </tr>
      `;
      else
        html = `
        <tr>
          <td>
            <span>${index + 1}</span>
            <img src="images/chat-logotest.png" />
          </td>
          <td>${addr}</td>
          <td>${totalBetAmountAll / 1000000} Tron</td>
        </tr>
      `;
      $('#leaderboard-bets-body').append(html);
    }
  );
};

function changeLanguage(lang) {
  document.cookie = `language=${lang}`;
}
