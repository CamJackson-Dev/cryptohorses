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
  
  // var tronNode = "https://api.shasta.trongrid.io";
  var tronNode = "https://api.trongrid.io"

  
  $(document).ready(async function() {
    listClick("all");
    allbetsLast50();
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
        } else if (level >= 96 && level <= 99) {
          levelTag = "G1 Owner";
        } else if (level == 100) {
          levelTag = "WINNA";
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
      odometer.innerHTML = parseInt(response.totalPaidAmt / 1000000);
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
    } else if(lvl==99){
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
          text: "You need to have level 3 to get chat access.",
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
            text: "You need to have minimum level 3 to get Chat access",
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