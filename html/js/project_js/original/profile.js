var global = {
    userAddress: "",
    userAddressHex: "",
    tronscanName: "",
    username: "",
    loggedIn: false,
    shortAddress: "",
    level: 0,
    userSigned: false
  };
  
  let allBets = [];
  let myBets = [];
  let filter = "all";
  let page = 10;
  let skip = 0;
  let selected = 1;
  let count = 0;
  
  const horseNames = [
    "Winnathunder",
    "Trontrot",
    "Troncruise",
    "Spuntino",
    "Blazer",
    "DarkMatter",
    "Mr. Ed",
    "Redhorse"
  ];

  var tokenContract = "TAjAMF7XZGexASiQDfa8XJ1xFLcqtYNcrg";
  var dividendContract = "TAa3BAntM7Cz5RMcci8jtN3Q8yccxGwGnF";
  var gameLocation1Contract = "TVqdSYfGpPQXeBHQUgAAqqkgCiqmvQBY1p";
  
  // var tronNode = "https://api.shasta.trongrid.io";
  var tronNode = "https://api.trongrid.io"
  
  const tW = require("tronweb");
  const privateKey = "b551d8c006243277095acc3461f398cf9800685ab1d69742c758ae17306f125e";
  
  const staticObject = new tW(tronNode, tronNode, tronNode, privateKey);
  
  var tokenContractInstance,
    dividendContractInstance,
    gameLocation1ContractInstance,
    tokenContractInstanceStatic,
    dividendContractInstanceStatic;
  
    $(document).ready(async function() {
      listClick("all");
      initInstanceStatic();
      getCurrentLangAndWallet();
      startLoginListener()
      // var tronLinkLoginCheck = getCookie("tronLinkLoginTracker");
      // if (tronLinkLoginCheck == 1) {
      // autotronLinkloginCheck();
      // }
  });
  
  // Login & Default Initialization
  
  $("#isLoggedIn").on("click", function() {
    // tronLinkloginCheck();
    if(global.loggedIn == false){
      $("#login-popup").modal("show");
    } else {
      autotronLinkloginCheck()
    }
  });
  
  function autotronLinkloginCheck() {
    let counter = 0;
    const maxAttempts = 4;
    window.addEventListener("tronWebInjected", { once: true });a
    const intervalId = setInterval(() => {
      const { tronWeb } = window;
      counter++;
      if (counter > maxAttempts) {
        window.removeEventListener("tronWebInjected", { once: true });
        return clearInterval(intervalId);
      }
      if (tronWeb) {
        if (tronWeb.ready) {
          initGlobalData();
          // console.log(global);
          setCookie("tronLinkLoginTracker", "1", 10);
          clearInterval(intervalId);
          dispatchEvent(new Event("tronWebInjected"));
        }
      }
    }, 1000);
  }
  
  async function tronLinkloginCheck() {
    let counter = 0;
    const maxAttempts = 4;
    window.addEventListener("tronWebInjected", { once: true });
    const intervalId = setInterval(() => {
      const { tronWeb } = window;
      counter++;
      if (counter > maxAttempts) {
        startLoginListener()
        $("#login-popup").modal("show");
        window.removeEventListener("tronWebInjected", { once: true });
        return clearInterval(intervalId);
      }
      if (tronWeb) {
        if (tronWeb.ready) {
          initGlobalData();
          // console.log(global);
          setCookie("tronLinkLoginTracker", "1", 10);
          clearInterval(intervalId);
          dispatchEvent(new Event("tronWebInjected"));
        }
      }
    }, 1000);
  }
  
  function startLoginListener(){
    var start = setInterval(() => {
      if(window.tronWeb && window.tronWeb.ready){
        if(window.tronWeb.eventServer.host.includes(tronNode)){
          initGlobalData();
          clearInterval(start)
        } else {
          setTimeout(()=> {
            Toastify({
              text: "Look's like your are on wrong network. Change your network to Mainet from your wallet",
              backgroundColor: "Tomato",
              duration: 10000,
              stopOnFocus: true,
              close: true,
              className: "info",
            }).showToast();
          }, 2500)
          listenForNetworkChange()
          clearInterval(start)
        }
      }
    }, 1000)
  }
  
  function listenForNetworkChange(){
    var start = setInterval(() => {
      if(window.tronWeb && window.tronWeb.ready){
        if(window.tronWeb.eventServer.host.includes(tronNode)){
          initGlobalData();
          clearInterval(start)
        }
      }
    }, 1000)
  }
  
  async function initGlobalData() {
    global.shortAddress = getUserAddress(window.tronWeb.defaultAddress.base58);
    $("#userAddress").text(global.shortAddress);
    $("#isLoggedIn").hide();
  
    global.tronscanName = await getTronscanName(tronWeb.defaultAddress.base58);
    global.userAddress = window.tronWeb.defaultAddress.base58;
    global.userAddressHex = window.tronWeb.defaultAddress.hex;
    global.loggedIn = true;
    // listClick("all");
    let response = null;
    try {
      response = await $.get(`${url}/isSigned/${global.userAddress}`);
    } catch (error) {
      // console.log("error", error);
    }
    global.userSigned = response.sign;
    // console.log(global);
    getPlayerLevel();
    initContractInstance();

    try {
        const profileData = await $.get(`${url}/getProfile/${global.userAddress}`);
        // console.log(profileData)
        if(profileData.msg == "success"){
          $("#levelPlayer").text(profileData.data.level);
          $("#playerRank").text(Math.ceil(profileData.data.level / 5));
          $("#totalBets").text(profileData.data.totalBets.toLocaleString("en"));
          $("#totalWinna").text(profileData.data.totalWinna.toLocaleString("en"));
          $("#totalEarning").text(
            profileData.data.comulativeEarning.toLocaleString("en") + " TRX"
          );
          $("#lastDrop").text(profileData.data.lastWinDrop + " TRX");
        }
    
        if (document.getElementById("my-profile-bets-body")) {
          filter = "all";
          skip = 0;
          selected = 1;
          count = 0;
          let response = await $.get(
            `${url}/hongkong/filter/${global.userAddress}?filter=${filter}&page=${page}&skip=${skip}`
          );
          myBets = response.location1bets;
          count = response.count;
          const options = Math.ceil(parseFloat(count / page));
    
          $("#skip")
            .children("a")
            .remove();
          for (let i = 1; i <= options; i++) {
            $("#skip").append(
                $("<a></a>").attr({
                    class: "dropdown-item skipChange",
                    href: "#",
                    name: i
                }).text(i)
            );
          }
    
          if (myBets.length !== 0) {
            document.getElementById("my-profile-bets-footer").style.display =
              "none";
          }
    
          myBets.forEach(
            ({
              leaderboard,
              orderId,
              transactionHash,
              predictedHorse,
              winAmount,
              createdAt
            }) => {
              const id = "my-profile-bets";
              var template = jQuery(`#${id}`).html();
              var html = Mustache.render(template, {
                order: orderId,
                hash: transactionHash,
                hashString: transactionHash.slice(0, 13),
                horsePrediction: horseNames[predictedHorse[0]["horse"]],
                winningHorse:
                  "[ 1st: " +
                  horseNames[leaderboard[0]] +
                  ", 2nd: " +
                  horseNames[leaderboard[1]] +
                  ", 3rd: " +
                  horseNames[leaderboard[2]] +
                  " ]",
                betAmount:
                  (predictedHorse[0]["win"] +
                    predictedHorse[0]["place"] +
                    predictedHorse[0]["show"]) /
                  1000000,
                winAmount: winAmount === 0 ? "-" : winAmount / 1000000,
                color: winAmount === 0 ? "color:#ff5959" : "color:#01F593",
                createdAt: new Date(createdAt).toLocaleString()
              });
              jQuery("#my-profile-bets-body").append(html);
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
    return firstFive + "..." + lastFive;
  }
  
  // Setting username with level, leveltag and player username for chat
  async function getPlayerLevel() {
    return new Promise(async function(resolve, reject) {
      try {
        const response = await $.get(`${url}/getLevel/${global.userAddress}`);
  
        global.level = response.level;
        var level = response.level;
  
        var levelTag;
  
        if (level == 0) {
          levelTag = "Visitor";
        } else if (level >= 1 && level <= 5) {
          levelTag = "Shoveller";
        } else if (level >= 6 && level <= 10) {
          levelTag = "Float Driver";
        } else if (level >= 11 && level <= 15) {
          levelTag = "Barrier Attendant";
        } else if (level >= 16 && level <= 20) {
          levelTag = "StableHand";
        } else if (level >= 21 && level <= 25) {
          levelTag = "Track Rider";
        } else if (level >= 26 && level <= 30) {
          levelTag = "Farrier";
        } else if (level >= 31 && level <= 35) {
          levelTag = "Horse Breaker";
        } else if (level >= 36 && level <= 40) {
          levelTag = "Strapper";
        } else if (level >= 41 && level <= 45) {
          levelTag = "Effinex";
        } else if (level >= 46 && level <= 50) {
          levelTag = "Apprentice";
        } else if (level >= 51 && level <= 55) {
          levelTag = "Jockey";
        } else if (level >= 56 && level <= 60) {
          levelTag = "Race Caller";
        } else if (level >= 61 && level <= 65) {
          levelTag = "Thoroughbred Trainer";
        } else if (level >= 66 && level <= 70) {
          levelTag = "Steward";
        } else if (level >= 71 && level <= 75) {
          levelTag = "Bloodstock Agent";
        } else if (level >= 76 && level <= 80) {
          levelTag = "Pro Syndicator";
        } else if (level >= 81 && level <= 85) {
          levelTag = "First Dude";
        } else if (level >= 86 && level <= 90) {
          levelTag = "G3 Owner";
        } else if (level >= 91 && level <= 95) {
          levelTag = "G2 Owner";
        } else if (level >= 96 && level <= 98) {
            levelTag = "G1 Owner";
        } else if (level == 99) {
            levelTag = "WINNA";
        } else if (level == 100) {
            levelTag = "Moderator";
        }
  
        global.username =
          "[ LVL " + level + " | " + levelTag + " ] " + global.tronscanName;
        resolve(true);
      } catch (error) {
        console.error(error);
      }
    });
  }
  
  function getTronscanName(address) {
    return new Promise(function(resolve, reject){
      var _returnName = "";
      $.ajax({
        url: "https://apilist.tronscan.org/api/account?address=" + address,
        dataType: "json",
        async: true,
        success: function(data) {
          if (data.name != "") {
            _returnName = data.name;
          } else {
            _returnName = getUserAddress(address);
          }
          resolve(_returnName);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          _returnName = getUserAddress(address);
          resolve(_returnName);
        }
      }); 
    }) 
  }
  
  setTimeout(function() {
    setInterval(updateWonAmont, 30000);
  }, 3000);
  
  async function updateWonAmont() {
    try {
      response = await $.get(`${url}/wonAmount`);
      var amt = parseInt(response.totalPaidAmt / 1000000)
      $('#wonAmount').animateNumbers(amt);
    } catch (error) {
      // console.log("error", error);
    }
  }
  
  /****************check for address change in tronlink --START*************************/
  //Try to set handle address change event
  let intervalID = setInterval(async function() {
    if (typeof window.tronWeb == "object") {
      // window.tronWeb.on("addressChanged", initGlobalData);
      try {
        var userAddress = await window.tronWeb.defaultAddress.base58;
        var userAddressHex = await window.tronWeb.defaultAddress.hex;
        if (global.userAddress == "" && userAddress != "") {
          // initGlobalData()
        }
        if (global.userAddress != "" && global.userAddress != userAddress) {
          global.userAddress = userAddress;
          global.userAddressHex = userAddressHex;
          clearInterval(intervalID);
          location.reload();
        }
      } catch (e) {}
    }
  }, 1000);
  
  /****************check for address change in tronlink --END*************************/
  /**************** Detect and set current language and wallet --START*************************/
  
  $(".walletDropDown").on("click", function() {
    var wallet = $(this).attr("name");
    if (wallet == "guild-wallet") {
      setCookie("wallet", wallet, 5);
      $("#currWallet").html('<img src="images/' + wallet + '.png">Guild Wallet');
    } else {
      setCookie("wallet", wallet, 5);
      $("#currWallet").html('<img src="images/' + wallet + '.png">TronLink');
    }
  });
  
  $(".languageDropDown").on("click", function() {
    var lang = $(this).attr("name");
    // console.log(lang);
    setCookie("language", lang, 30);
    location.reload();
    $("#currLang").text($(this).text());
  });
  
  function getCurrentLangAndWallet() {
    var lang = getCookie("language");
    if (lang == "ru") {
      $("#currLang").text("Pусский");
    } else if (lang == "de") {
      $("#currLang").text("Deutsch");
    } else if (lang == "zh-CN") {
      $("#currLang").text("简体中文");
    } else if (lang == "kr") {
      $("#currLang").text("한국어");
    } else if (lang == "es") {
      $("#currLang").text("Español");
    } else if (lang == "po") {
      $("#currLang").text("Português");
    } else if (lang == "fr") {
      $("#currLang").text("Français");
    } else {
      setCookie("language", "en", 5);
      $("#currLang").text("English");
    }
  
    var wallet = getCookie("wallet");
    if (wallet == "guild-wallet") {
      $("#currWallet").html('<img src="images/' + wallet + '.png">Guild Wallet');
    } else {
      setCookie("wallet", "tronlink", 5);
      $("#currWallet").html('<img src="images/tronlink.png">TronLink');
    }
  }
  
  /**************** Detect and set current language and wallet --END*************************/
  
  // Function to set and get cookie
  
  function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }
  
  function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
  
  /**************** Function to update dividend panel data --START*************************/
  nextDropTimer()
  
  async function nextDropTimer(){
    var res = await $.get(`${url}/nextDrop`);
  
    var registrationStart = new Date(res.nextWinnaDrop * 1000);
    var countDownDate = new Date(registrationStart).getTime();
    var x = setInterval(function(){
      var hours, minutes, seconds;
  
      var now = new Date().getTime();
  
      var distance = countDownDate - now;
      hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      seconds = Math.floor((distance % (1000 * 60)) / 1000);
      // console.log(hours + ':' + minutes + ':' + seconds);
  
      $("#nextWinnaDrop").text(hours + ":" + minutes + ":" + seconds);
      if (distance < 0) {
        clearInterval(x);
        $("#nextWinnaDrop").text('Distributing dividends...');
      }
  
    }, 1000)
    
  }
  
  
  setInterval(updateMintInfo, 4000);
  async function updateMintInfo() {
  //   if (tronWeb && tronWeb.ready && tronWeb.eventServer.host.includes(tronNode)) {
      try {
        var stage = await tokenContractInstanceStatic.stage().call();
        var level = await tokenContractInstanceStatic.level().call();
        var mintInfo = await tokenContractInstanceStatic
          .getMintInfoByStageAndLevel(stage, level)
          .call();
        var availableDrop = await dividendContractInstanceStatic
          .availableMainDividendALL()
          .call();
        var totalFrozenWinna = await dividendContractInstanceStatic
          .totalForzenWinnaAcrossNetwork()
          .call();
        
  
        var miningDifficulty = staticObject.fromSun(mintInfo.difficulty);
        var totalMintLimit = staticObject.fromSun(mintInfo.totalMintLimit);
        var mintedTillNow = staticObject.fromSun(mintInfo.mintedTillNow);
  
        var availableTRXDrop = staticObject.fromSun(availableDrop[1]);
        if (availableDrop[0] || availableTRXDrop == 0) {
          $("#availableWinnaDrop").text(
            parseFloat(availableTRXDrop)
              .toFixed(2)
              .toLocaleString("en") + " TRX"
          );
        } else {
          $("#availableWinnaDrop").text(
            "-" +
              parseFloat(availableTRXDrop)
                .toFixed(2)
                .toLocaleString("en") +
              " TRX"
          );
        }
  
        totalFrozenWinna = staticObject.fromSun(totalFrozenWinna);
        $("#totalFrozenWinna").text(
          parseFloat(totalFrozenWinna)
            .toFixed(2)
            .toLocaleString("en") + " WINNA"
        );
  
        if(window.tronWeb && window.tronWeb.ready && window.tronWeb.eventServer.host.includes(tronNode)){
          var availDivPlayer = await dividendContractInstanceStatic
          .availableDividendIndividualLive(window.tronWeb.defaultAddress.base58)
          .call();
  
          availDivPlayer = staticObject.fromSun(availDivPlayer);
          $("#playerDividend").text(
              parseFloat(availDivPlayer)
              .toFixed(2)
              .toLocaleString("en") + " TRX"
          );
        } else {
          $("#playerDividend").text("0 TRX");
        }
  
        $("#stage").text(stage);
        $("#level").text(level);
        $("#difficulty").text(miningDifficulty + " TRX");
        $("#mintedtillNow").text(
          parseFloat(mintedTillNow)
            .toFixed(2)
            .toLocaleString("en")
        );
        $("#mintLimit").text(parseFloat(totalMintLimit).toLocaleString("en"));
  
        var percentage = (mintedTillNow / totalMintLimit) * 100 + "%";
  
        $("#progressBar").css({ width: percentage });
      } catch (error) {
        console.log("error", error);
      }
  }
  var globalInfo = {
    winnaBalance: 0,
    frozenWinna: 0,
    pendingWithdraw: 0,
    withdrawTime: 0,
    systemHalt: false
  };
  setTimeout(function() {
    setInterval(updateWinnaInfo, 1000);
  }, 3000);
  
  async function updateWinnaInfo() {
    if (window.tronWeb && window.tronWeb.ready && window.tronWeb.eventServer.host.includes(tronNode)) {
      try {
        var balance = await tokenContractInstance
          .balanceOf(window.tronWeb.defaultAddress.base58)
          .call();
        var playerStackInfo = await dividendContractInstance
          .playerStackInfoByAddress(window.tronWeb.defaultAddress.base58)
          .call();
        var systemHalt = await dividendContractInstance
          .dividendSystemHalt()
          .call();
  
        globalInfo.winnaBalance = balance.toNumber().toFixed(2) / 1000000;
  
        balance =
          balance.toNumber() > 0
            ? balance.toNumber().toFixed(2) / 1000000 + " WINNA"
            : "0 WINNA";
        var playerFrozenWinna =
          playerStackInfo.frozenWinna.toNumber() > 0
            ? playerStackInfo.frozenWinna.toNumber().toFixed(2) / 1000000 +
              " WINNA"
            : "0 WINNA";
        var playerPendingWithdraw =
          playerStackInfo.pendingWithdraw.toNumber() > 0
            ? playerStackInfo.pendingWithdraw.toNumber().toFixed(2) / 1000000 +
              " WINNA"
            : "0 WINNA";
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
          $("#claim").attr("disabled", false);
          var registrationStart = new Date(globalInfo.withdrawTime * 1000);
          var countDownDate = new Date(registrationStart).getTime();
          var unfreezeDate = new Date(registrationStart).toLocaleString();
  
          $("#unfreezeDate").text(unfreezeDate);
  
          var hours, minutes, seconds;
  
          var now = new Date().getTime();
  
          var distance = countDownDate - now;
          hours = Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          seconds = Math.floor((distance % (1000 * 60)) / 1000);
          // console.log(hours + ':' + minutes + ':' + seconds);
  
          $("#clock").text(hours + ":" + minutes + ":" + seconds);
          $("#claimOrCancle").text("Cancle Unfreeze");
          if (distance < 0) {
            // clearInterval(x);
            $("#clock").text("0 : 00 : 00");
            $("#claimOrCancle").text("Claim WINNA");
            // console.log("Registration has started.");
          }
          // }, 1000)
        } else {
          $("#claim").attr("disabled", true);
          // clearInterval(x);
        }
  
        $("#availableWinna").val(globalInfo.winnaBalance + " WINNA");
        $("#frozenWinna").val(globalInfo.frozenWinna + " WINNA");
        $("#unfreezeAmt").val(globalInfo.pendingWithdraw + " WINNA");
  
        //Freeze popup
        $("#freezableWinna").text(globalInfo.winnaBalance + " WINNA");
        $("#unfreezableWinna").text(globalInfo.frozenWinna + " WINNA");
        $("#pendingFreezeeWinna").text(globalInfo.pendingWithdraw + " WINNA");
      } catch (e) {
        // console.log(e);
        $("#availableWinna").val("0 WINNA");
        $("#frozenWinna").val("0 WINNA");
        $("#unfreezeAmt").val("0 WINNA");
      }
    } else {
      $("#availableWinna").val("0 WINNA");
      $("#frozenWinna").val("0 WINNA");
      $("#unfreezeAmt").val("0 WINNA");
    }
  }
  
  $("#freezableWinna").on("click", function() {
    $("#frzAmt").val(globalInfo.winnaBalance);
  });
  
  $("#unfreezableWinna").on("click", function() {
    $("#unfrzAmt").val(globalInfo.frozenWinna);
  });
  $("#freeze").on("click", async function() {
    if (window.tronWeb && window.tronWeb.ready && window.tronWeb.eventServer.host.includes(tronNode)) {
      try {
        var systemHalt = await dividendContractInstance
          .dividendSystemHalt()
          .call();
        if (systemHalt == true) {
            Toastify({
                text: "We are distributing dividend.<br> All Functionality is not accesable at the moment",
                backgroundColor: "Tomato",
                duration: 10000,
                stopOnFocus: true,
                close: true,
                className: "info",
            }).showToast();
            return;
        } else {
          $("#freezeWinnaModal").modal("show");
        }
      } catch (e) {
        //error
      }
    } else {
      $("#login-popup").modal("show");
    }
  });
  
  $("#frzAmt").on("keyup", function() {
    var inputVal = $("#frzAmt").val();
    if (!isNaN(inputVal)) {
      if (globalInfo.winnaBalance == 0) {
        $("#frzAmt").val(0);
      } else if (inputVal > globalInfo.winnaBalance) {
        $("#frzAmt").val(globalInfo.winnaBalance);
      }
    } else {
      $("#frzAmt").val(0);
    }
  });
  
  $("#freezeConfirm").on("click", async function() {
    if (window.tronWeb && window.tronWeb.ready && window.tronWeb.eventServer.host.includes(tronNode)) {
      var amt = $("#frzAmt").val();
      try{
        var addr = await window.tronWeb.defaultAddress.base58;
        var t = await tokenContractInstanceStatic.playerMintInfo(addr).call();
        if(t.totalBets.toNumber() >= 43250000000){
          if (amt != "" && amt >= 1) {
            amt = window.tronWeb.toSun(amt);
            try {
              var frzTx = await tokenContractInstance.approveAndFreeze(amt).send({
                shouldPollResponse: false,
                feeLimit: 5000000
              });
              var response = await waitForTxConfirmationEvent(frzTx, "FreezeWinna");
              if(response){
                Toastify({
                  text: "Successfully Frozen WINNA",
                  backgroundColor: "MediumSeaGreen",
                  duration: 10000,
                  close: true,
                  className: "info",
                }).showToast();
                $("#frzAmt").val('');
                $("#freezeWinnaModal").modal("hide");
              } else {
                console.log("error", error);
                Toastify({
                  text: "Transaction Failed!",
                  backgroundColor: "Tomato",
                  duration: 10000,
                  close: true,
                  className: "info",
                }).showToast();
                $("#frzAmt").val('');
              }
            } catch (error) {
              console.log("error", error);
              Toastify({
                text: "Transaction Failed!",
                backgroundColor: "Tomato",
                duration: 10000,
                close: true,
                className: "info",
              }).showToast();
              $("#frzAmt").val('');
            }
          } else {
            Toastify({
              text: "Minimum Freeze amount is 1 WINNA",
              backgroundColor: "Tomato",
              duration: 10000,
              close: true,
              className: "info",
            }).showToast();
            $("#frzAmt").val('');
          }
        } else {
          Toastify({
            text: "You need to have minimum level 5 to start freezing WINNA",
            backgroundColor: "Tomato",
            duration: 10000,
            close: true,
            className: "info",
          }).showToast();
          $("#frzAmt").val('');
        }
      } catch(e){console.log(e)}
    } else {
      $("#login-popup").modal("show");
    }
  });
  
  $("#unfreeze").on("click", async function() {
    if (window.tronWeb && window.tronWeb.ready && window.tronWeb.eventServer.host.includes(tronNode)) {
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
          Toastify({
            text: "We are distributing dividend.<br> All Functionality is not accesable at the moment",
            backgroundColor: "Tomato",
            duration: 10000,
            stopOnFocus: true,
            close: true,
            className: "info",
          }).showToast();
          return ;
        } else if (pendingWithdraw != 0) {
          Toastify({
            text: "You have already pending frozen winna.<br>You can unfreeze after claiming that or cancle that unfreeze process",
            backgroundColor: "Tomato",
            duration: 10000,
            stopOnFocus: true,
            close: true,
            className: "info",
          }).showToast();
          return;
        } else {
          $("#unfreezeWinnaModal").modal("show");
        }
      } catch (e) {
        // console.log(e);
      }
    } else {
      $("#login-popup").modal("show");
    }
  });
  
  $("#unfrzAmt").on("keyup", function() {
    var inputVal = $("#unfrzAmt").val();
    if (!isNaN(inputVal)) {
      if (globalInfo.frozenWinna == 0) {
        $("#unfrzAmt").val(0);
      } else if (inputVal > globalInfo.frozenWinna) {
        $("#unfrzAmt").val(globalInfo.frozenWinna);
      }
    } else {
      $("#unfrzAmt").val(0);
    }
  });
  
  $("#unfreezeConfirm").on("click", async function() {
    if (window.tronWeb && window.tronWeb.ready && window.tronWeb.eventServer.host.includes(tronNode)) {
      var amt = $("#unfrzAmt").val();
      if (amt != "" && amt >= 1) {
        amt = window.tronWeb.toSun(amt);
  
        try {
          var unfrzTx = await dividendContractInstance.Unfreeze(amt).send({
            shouldPollResponse: false,
            feeLimit: 5000000
          });
          var response = await waitForTxConfirmationEvent(unfrzTx, "UnfreezeWinna");
          if(response){
            $("#unfreezeWinnaModal").modal("hide");
            Toastify({
              text: "Successfully Unfrozen WINNA",
              backgroundColor: "MediumSeaGreen",
              duration: 10000,
              close: true,
              className: "info",
            }).showToast();
            $("#unfrzAmt").val('');
          } else {
            Toastify({
              text: "Transaction Failed!",
              backgroundColor: "Tomato",
              duration: 10000,
              close: true,
              className: "info",
            }).showToast();
            $("#unfrzAmt").val('');
          }
        } catch (error) {
          Toastify({
            text: "Transaction Failed!",
            backgroundColor: "Tomato",
            duration: 10000,
            close: true,
            className: "info",
          }).showToast();
          $("#unfrzAmt").val('');
          console.log("error", error);
        }
      } else {
        Toastify({
          text: "Minimum Unfreeze amount is 1 WINNA",
          backgroundColor: "Tomato",
          duration: 10000,
          close: true,
          className: "info",
        }).showToast();
        $("#unfrzAmt").val('');
      }
    } else {
      $("#login-popup").modal("show");
    }
  });
  
  $("#claim").on("click", function() {
    if (window.tronWeb && window.tronWeb.ready && window.tronWeb.eventServer.host.includes(tronNode)) {
      $("#claimWinnaModal").modal("show");
    } else {
      $("#login-popup").modal("show");
    }
  });
  
  $("#claimOrCancle").on("click", async function() {
    if (window.tronWeb && window.tronWeb.ready && window.tronWeb.eventServer.host.includes(tronNode)) {
      try {
        var playerStackInfo = await dividendContractInstance
          .playerStackInfoByAddress(global.userAddress)
          .call();
        var unfreezeTimestamp = playerStackInfo.withdrawTime.toNumber();
        var currentTimestamp = parseInt(Date.now() / 1000);
        if (unfreezeTimestamp < currentTimestamp && unfreezeTimestamp != 0) {
          try {
            var claimTx = await dividendContractInstance.ClaimWinna().send({
              shouldPollResponse: false,
              feeLimit: 3000000
            });
            var response = await waitForTxConfirmationEvent(claimTx, "WithdrawWinna");
            if(response){
              $("#claimWinnaModal").modal("hide");
              Toastify({
                text: "Successfully Claimed WINNA. <br>It is credited to your account.",
                backgroundColor: "MediumSeaGreen",
                duration: 10000,
                close: true,
                className: "info",
              }).showToast();
            } else {
              Toastify({
                text: "Transaction Failed!",
                backgroundColor: "Tomato",
                duration: 10000,
                close: true,
                className: "info",
              }).showToast();
              console.log("error", error);
            }
          } catch (error) {
            Toastify({
              text: "Transaction Failed!",
              backgroundColor: "Tomato",
              duration: 10000,
              close: true,
              className: "info",
            }).showToast();
            console.log("error", error);
          }
        } else if (
          unfreezeTimestamp > currentTimestamp &&
          unfreezeTimestamp != 0
        ) {
          try {
            var cancleTx = await dividendContractInstance.CancleUnfreeze().send({
              shouldPollResponse: false,
              feeLimit: 3000000
            });
            var response = await waitForTxConfirmationEvent(cancleTx, "UnfreezeWinnaCancle");
            if(response){
              $("#claimWinnaModal").modal("hide");
              Toastify({
                text: "WINNA unfrozen process cancled",
                backgroundColor: "MediumSeaGreen",
                duration: 10000,
                close: true,
                className: "info",
              }).showToast();
            } else {
              Toastify({
                text: "Transaction Failed!",
                backgroundColor: "Tomato",
                duration: 10000,
                close: true,
                className: "info",
              }).showToast();
              console.log("error", error);
            }
            
          } catch (error) {
            Toastify({
              text: "Transaction Failed!",
              backgroundColor: "Tomato",
              duration: 10000,
              close: true,
              className: "info",
            }).showToast();
            console.log("error", error);
          }
        } else {
          $("#login-popup").modal("show");
        }
      } catch (e) {
        //error
      }
    }
  });
  async function initContractInstance() {
    if (window.tronWeb && window.tronWeb.ready && window.tronWeb.eventServer.host.includes(tronNode)) {
      try {
        var tokenContractInfo = await window.tronWeb.trx.getContract(tokenContract);
        tokenContractInstance = await window.tronWeb.contract(
          tokenContractInfo.abi.entrys,
          tokenContractInfo.contract_address
        );
  
        var dividendContractInfo = await window.tronWeb.trx.getContract(
          dividendContract
        );
        dividendContractInstance = await window.tronWeb.contract(
          dividendContractInfo.abi.entrys,
          dividendContractInfo.contract_address
        );
  
  
  
      //   var gameContractInfo = await window.tronWeb.trx.getContract(
      //     gameLocation1Contract
      //   );
      //   gameLocation1ContractInstance = await window.tronWeb.contract(
      //     gameContractInfo.abi.entrys,
      //     gameContractInfo.contract_address
      //   );
        // updateWinnaInfo()
      } catch (error) {
        console.log("error", error);
      }
    }
  }
  
  async function initInstanceStatic(){
      try{
          var tokenContractInfo = await staticObject.trx.getContract(tokenContract);
          tokenContractInstanceStatic = await staticObject.contract(
            tokenContractInfo.abi.entrys,
            tokenContractInfo.contract_address
          );
      
          var dividendContractInfo = await staticObject.trx.getContract(
            dividendContract
          );
          dividendContractInstanceStatic = await staticObject.contract(
            dividendContractInfo.abi.entrys,
            dividendContractInfo.contract_address
          );
      }catch(e){}
  
  }
  
  function waitForTxConfirmation(txId){
    return new Promise(function(resolve, reject){
      var checkTxStatus = setInterval(async function() {
        try {
          var status = await tronWeb.trx.getTransactionInfo(txId);
          if (status) {
            if (status.receipt.result == "SUCCESS") {
              clearInterval(checkTxStatus);
              resolve(true)
            } else {
              clearInterval(checkTxStatus);
              resolve(false)
            }
          }
        } catch (error) {
          // console.log(error)
        }
      }, 1000);
    })
  }  
  
  function waitForTxConfirmationEvent(txId, eventName){
    return new Promise(function(resolve, reject){
      var checkTxStatus = setInterval(async function() {
        try {
          var event = await tronWeb.getEventByTransactionID(txId);
          if(event.length >= 1){
              var findIndex = event.findIndex(eventArray => eventArray.name === eventName);
              if(findIndex != -1){
                clearInterval(checkTxStatus);
                resolve(true)
              } else {
                clearInterval(checkTxStatus);
                resolve(false)
              }
          }
        } catch (error) {
          // console.log(error)
        }
      }, 1000);
    })
  }
  /**************** Function to update dividend panel data --END*************************/
  
  /******************************** chat box code --START********************************/
  
  let roomName = "";
  var socket = io();
  // scroll to bottom
  function scrollToBottom() {
    var messages = jQuery("#messages");
    var scrollHeight = messages.prop("scrollHeight");
    messages.scrollTop(scrollHeight);
  }
  
  $(".changeChatRoom").on('click', function(){
      var room = $(this).attr('name')
      listClick(room);
  })
  
  function listClick(room) {
    roomName = room;
    $("#messages").empty();
    socket.emit("join", {
      room: room,
      username: global.username,
      address: global.userAddress
    });
  }
  
  // Socket Code
  
  function getUserameClass(lvl){
    if(lvl>=1 && lvl <=24){
      return "usernames1"
    } else if(lvl>=25 && lvl<=49){
      return "usernames2"
    } else if(lvl>=50 && lvl<=74){
      return "usernames3"
    } else if(lvl>=75 && lvl<=98){
      return "usernames4"
    } else if(lvl==99 || lvl == 100){
      return "usernames5"
    }
  }
  
  socket.on("connect", function() {
    // console.log("user connected");
  });
  
  socket.on("disconnect", function() {
    // console.log("Disconnected from server");
  });
  
  socket.on("getMessage", async ({ address }) => {
    try {
      const response = await $.get(`${url}/chat/${roomName}`);
      response.chats.forEach(({ userName, userAddress, message, level }) => {
        const id =
          address === userAddress
            ? "message-template-sender"
            : "message-template-receiver";
        var template = jQuery(`#${id}`).html();
        var color = getUserameClass(level)
        var html = Mustache.render(template, {
          color,
          userName,
          message,
          image: "1"
        });
        jQuery("#messages").prepend(html);
      });
      scrollToBottom();
    } catch (error) {
      // console.error(error);
    }
  });
  
  socket.on("newMessage", function({ userName, message, level }) {
    const id =
      userName === global.username
        ? "message-template-sender"
        : "message-template-receiver";
    var template = jQuery(`#${id}`).html();
    var color = getUserameClass(level)
    var html = Mustache.render(template, {
      color,
      userName,
      message,
      image: "1"
    });
    jQuery("#messages").append(html);
    scrollToBottom();
  });
  
// Get message from All group textarea
jQuery("#all-chats-form").on("submit", async e => {
  e.preventDefault();
  if (window.tronWeb && window.tronWeb.ready && window.tronWeb.eventServer.host.includes(tronNode)) {
    if (global.userSigned == false) {
      let playerExist = false;
      try {
        const res = await $.get(
          `${url}/check/player/${global.userAddress}`
        );
        playerExist = res.flag;
      } catch (error) {
        // console.log("error", error);
      }
      if (!playerExist) {
        Toastify({
          text: "You need to have level 5 to get chat access.",
          backgroundColor: "Tomato",
          duration: 10000,
          stopOnFocus: true,
          close: true,
          className: "info",
        }).showToast();
        $('.textarea-chat-inputfield').text('');
        $('.textarea-chat-inputfield').val('');
        return;
      }
  
      var hex = window.tronWeb.toHex("tronhorses");
      hex = hex.substring(2);
      try {
        var signed = await window.tronWeb.trx.sign(hex);
        if (signed != "") {
          socket.emit("signChat", {userAddress: global.userAddress, sign: signed}, function(){
            global.userSigned = true;
            $("#sendMsg").trigger("click");
          });
        }
      } catch (e) {
        //error
      }
    } else {
      try {
        await getPlayerLevel();
  
        var messageEmojibox = $('.textarea-chat-inputfield').val();
        var messageTextbox = $('.textarea-chat-inputfield').text();
        
        var finalmsg;
        if(messageEmojibox.length <=2 && messageTextbox != ""){
          finalmsg = messageEmojibox + messageTextbox;
        } else if(messageEmojibox.length >=4 && !(messageEmojibox.includes(messageTextbox))) {
          finalmsg = messageEmojibox + messageTextbox;
        } else {
          finalmsg = messageEmojibox;
        }

        finalmsg = finalmsg.substring(0, 127);

        const data = {
          userAddress: global.userAddress,
          userName: global.username,
          level: global.level,
          message: finalmsg,
          room: roomName
        };

        socket.emit("createMessage", data, function() {
            $('.textarea-chat-inputfield').text('');
            $('.textarea-chat-inputfield').val('');
        });
      } catch (error) {
        console.log(error)
        if (error.responseText.includes("is less than minimum allowed value")) {
          Toastify({
            text: "You need to have minimum Level 5 to get Chat access",
            backgroundColor: "Tomato",
            duration: 10000,
            stopOnFocus: true,
            close: true,
            className: "info",
          }).showToast();
          // jQuery("[name=all-message]").val("");
          $('.textarea-chat-inputfield').text('');
          $('.textarea-chat-inputfield').val('');
        }
        // console.error(error);
      }
    }
  } else {
    $("#login-popup").modal("show");
  }
});

// Press Enter Submit form
$("#all-chats-form").on('keydown', '.textarea-chat-inputfield', function(e) {
  if (e.which == 13) {
    $("form#all-chats-form").submit();
    return false;
  }
});

$(".locationChange").on('click', function(){
    var selected = $(this).attr('name');
    locationChange(selected)
    $("#currLocation").text($(this).text())
})

$(".filterChange").on('click', function(){
    var selected = $(this).attr('name');
    filterChange(selected)
    $("#currFilter").text($(this).text())
})

$("#skip").on('click', '.skipChange', function(){
    var selected = $(this).attr('name');
    skipChange(selected)
    $("#currSkip").text(selected)
})

$(".pageChange").on('click', function(){
    var selected = $(this).attr('name');
    pageChange(selected)
    $("#currPage").text($(this).text())
})

const locationChange = (selectValue) => {
    // const value = document.getElementById("location").value;
};
  
  const filterChange = async (selectValue) => {
    $("#my-profile-bets-body").empty();
    // let selectValue = document.getElementById("filter").value;
    filter = selectValue;
    skip = 0;
    selected = 1;
    count = 0;
  
    let response = await $.get(
      `${url}/hongkong/filter/${global.userAddress}?filter=${filter}&page=${page}&skip=${skip}`
    );
    // console.log("response", response);x 
    myBets = response.location1bets;
    count = response.count;
  
    const options = Math.ceil(parseFloat(count / page));
    $("#skip")
      .children("a")
      .remove();
    for (let i = 1; i <= options; i++) {
      $("#skip").append(
        $("<a></a>").attr({
            class: "dropdown-item skipChange",
            href: "#",
            name: i
        }).text(i)
      );
    }
  
    if (myBets.length === 0)
      document.getElementById("my-profile-bets-footer").style.display =
        "table-footer-group";
    else document.getElementById("my-profile-bets-footer").style.display = "none";
  
    myBets.forEach(
      ({
        leaderboard,
        orderId,
        transactionHash,
        predictedHorse,
        winAmount,
        createdAt
      }) => {
        const id = "my-profile-bets";
        var template = jQuery(`#${id}`).html();
        var html = Mustache.render(template, {
          order: orderId,
          hash: transactionHash,
          hashString: transactionHash.slice(0, 13),
          horsePrediction: horseNames[predictedHorse[0]["horse"]],
          winningHorse:
            "[ 1st: " +
            horseNames[leaderboard[0]] +
            ", 2nd: " +
            horseNames[leaderboard[1]] +
            ", 3rd: " +
            horseNames[leaderboard[2]] +
            " ]",
          betAmount:
            (predictedHorse[0]["win"] +
              predictedHorse[0]["place"] +
              predictedHorse[0]["show"]) /
            1000000,
          winAmount: winAmount === 0 ? "-" : winAmount / 1000000,
          color: winAmount === 0 ? "color:#ff5959" : "color:#01F593",
          createdAt: new Date(createdAt).toLocaleString()
        });
        jQuery("#my-profile-bets-body").append(html);
      }
    );
  };
  
  const pageChange = async (selectValue) => {
    $("#my-profile-bets-body").empty();
    // let selectValue = document.getElementById("page").value;
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
    $("#skip")
      .children("a")
      .remove();
    for (let i = 1; i <= options; i++) {
      $("#skip").append(
        $("<a></a>").attr({
            class: "dropdown-item skipChange",
            href: "#",
            name: i
        }).text(i)
      );
    }
  
    if (myBets.length === 0)
      document.getElementById("my-profile-bets-footer").style.display =
        "table-footer-group";
    else document.getElementById("my-profile-bets-footer").style.display = "none";
  
    myBets.forEach(
      ({
        leaderboard,
        orderId,
        transactionHash,
        predictedHorse,
        winAmount,
        createdAt
      }) => {
        const id = "my-profile-bets";
        var template = jQuery(`#${id}`).html();
        var html = Mustache.render(template, {
          order: orderId,
          hash: transactionHash,
          hashString: transactionHash.slice(0, 13),
          horsePrediction: horseNames[predictedHorse[0]["horse"]],
          winningHorse:
            "[ 1st: " +
            horseNames[leaderboard[0]] +
            ", 2nd: " +
            horseNames[leaderboard[1]] +
            ", 3rd: " +
            horseNames[leaderboard[2]] +
            " ]",
          betAmount:
            (predictedHorse[0]["win"] +
              predictedHorse[0]["place"] +
              predictedHorse[0]["show"]) /
            1000000,
          winAmount: winAmount === 0 ? "-" : winAmount / 1000000,
          color: winAmount === 0 ? "color:#ff5959" : "color:#01F593",
          createdAt: new Date(createdAt).toLocaleString()
        });
        jQuery("#my-profile-bets-body").append(html);
      }
    );
  };
  
  const skipChange = async (selectValue) => {
    $("#my-profile-bets-body").empty();
    // let selectValue = document.getElementById("skip").value;
    skip = parseInt(selectValue) - 1;
    selected = skip + 1;
  
    let response = await $.get(
      `${url}/hongkong/filter/${global.userAddress}?filter=${filter}&page=${page}&skip=${skip}`
    );
    myBets = response.location1bets;
    count = response.count;
  
    $("#skip select").val(selected);
  
    if (myBets.length === 0)
      document.getElementById("my-profile-bets-footer").style.display =
        "table-footer-group";
    else document.getElementById("my-profile-bets-footer").style.display = "none";
  
    myBets.forEach(
      ({
        leaderboard,
        orderId,
        transactionHash,
        predictedHorse,
        winAmount,
        createdAt
      }) => {
        const id = "my-profile-bets";
        var template = jQuery(`#${id}`).html();
        var html = Mustache.render(template, {
          order: orderId,
          hash: transactionHash,
          hashString: transactionHash.slice(0, 13),
          horsePrediction: horseNames[predictedHorse[0]["horse"]],
          winningHorse:
            "[ 1st: " +
            horseNames[leaderboard[0]] +
            ", 2nd: " +
            horseNames[leaderboard[1]] +
            ", 3rd: " +
            horseNames[leaderboard[2]] +
            " ]",
          betAmount:
            (predictedHorse[0]["win"] +
              predictedHorse[0]["place"] +
              predictedHorse[0]["show"]) /
            1000000,
          winAmount: winAmount === 0 ? "-" : winAmount / 1000000,
          color: winAmount === 0 ? "color:#ff5959" : "color:#01F593",
          createdAt: new Date(createdAt).toLocaleString()
        });
        jQuery("#my-profile-bets-body").append(html);
      }
    );
  };
  
  
setTimeout(function(){
    handleLeaderboard()
    setInterval(handleLeaderboard, 600000)
}, 3000)
  
  const handleLeaderboard = async () => {
    let response = await $.get(`${url}/top-players`);
    $("#leaderboard-bets-body").empty();
    response.leaderBoard.forEach(
      ({ playerAddress, totalBetAmountAll }, index) => {
  
        var addr = getUserAddress(playerAddress)
        let html = "";
        if (index === 0)
          html = `
          <tr>
            <td>
              <span><img src="images/first-rank.png"/></span>
              <img src="images/chat-logo.png" />
            </td>
            <td>${addr}</td>
            <td>${totalBetAmountAll / 1000000} TRX</td>
          </tr>
        `;
        else if (index === 1)
          html = `
          <tr>
            <td>
              <span><img src="images/second-rank.png"/></span>
              <img src="images/chat-logo.png" />
            </td>
            <td>${addr}</td>
            <td>${totalBetAmountAll / 1000000} TRX</td>
          </tr>
        `;
        else if (index === 2)
          html = `
          <tr>
            <td>
              <span><img src="images/third-rank.png"/></span>
              <img src="images/chat-logo.png" />
            </td>
            <td>${addr}</td>
            <td>${totalBetAmountAll / 1000000} TRX</td>
          </tr>
        `;
        else
          html = `
          <tr>
            <td>
              <span>${index + 1}</span>
              <img src="images/chat-logo.png" />
            </td>
            <td>${addr}</td>
            <td>${totalBetAmountAll / 1000000} TRX</td>
          </tr>
        `;
        $("#leaderboard-bets-body").append(html);
      }
    );
  };
  