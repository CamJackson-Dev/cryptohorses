function CBetPanel() {
  var _iTotBet;
  var _iCurPage;
  var _iChipSelected;
  var _aPages;
  var _aHistory;
  var _pStartPosExit;
  var _pStartPosAudio;
  var _pStartPosFullscreen;

  var _oButFullscreen;
  var _fRequestFullScreen = null;
  var _fCancelFullScreen = null;
  var _oMaskPanel;
  var _oArrowLeft;
  var _oArrowRight;
  var _oChipPanel;
  var _oMsgBox;
  var _oButExit;
  var _oAudioToggle;
  var _oContainerPages;
  var _oContainer;

  var _horseselected = 0;

  this._init = function () {
    _iTotBet = 0;
    _iChipSelected = 0;
    _aHistory = new Array();

    _oContainer = new createjs.Container();
    s_oStage.addChild(_oContainer);

    var oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_bet_panel'));
    _oContainer.addChild(oBg);

    var oSpriteExit = s_oSpriteLibrary.getSprite('but_exit');
    _pStartPosExit = {
      x: CANVAS_WIDTH - oSpriteExit.width / 2 - 10,
      y: oSpriteExit.height / 2 + 10,
    };
    _oButExit = new CGfxButton(
      _pStartPosExit.x,
      _pStartPosExit.y,
      oSpriteExit,
      _oContainer
    );
    _oButExit.addEventListener(ON_MOUSE_UP, this.onExit, this);

    if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
      var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
      _pStartPosAudio = {
        x: _pStartPosExit.x - oSpriteExit.width - 10,
        y: oSprite.height / 2 + 10,
      };
      _oAudioToggle = new CToggle(
        _pStartPosAudio.x,
        _pStartPosAudio.y,
        oSprite,
        s_bAudioActive,
        s_oStage
      );
      _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
      _pStartPosFullscreen = {
        x: _pStartPosAudio.x - oSprite.width / 2 - 10,
        y: _pStartPosAudio.y,
      };
    } else {
      _pStartPosFullscreen = {
        x: _pStartPosExit.x - oSpriteExit.width - 10,
        y: _pStartPosExit.y,
      };
    }

    var doc = window.document;
    var docEl = doc.documentElement;
    _fRequestFullScreen =
      docEl.requestFullscreen ||
      docEl.mozRequestFullScreen ||
      docEl.webkitRequestFullScreen ||
      docEl.msRequestFullscreen;
    _fCancelFullScreen =
      doc.exitFullscreen ||
      doc.mozCancelFullScreen ||
      doc.webkitExitFullscreen ||
      doc.msExitFullscreen;

    if (ENABLE_FULLSCREEN === false) {
      _fRequestFullScreen = false;
    }

    if (_fRequestFullScreen && screenfull.enabled) {
      oSprite = s_oSpriteLibrary.getSprite('but_fullscreen');

      _oButFullscreen = new CToggle(
        _pStartPosFullscreen.x,
        _pStartPosFullscreen.y,
        oSprite,
        s_bFullscreen,
        s_oStage
      );
      _oButFullscreen.addEventListener(
        ON_MOUSE_UP,
        this._onFullscreenRelease,
        this
      );
    }

    var oSpriteBg = s_oSpriteLibrary.getSprite('simple_bet_panel');
    BET_PANEL_WIDTH = oSpriteBg.width;
    BET_PANEL_HEIGHT = oSpriteBg.height;

    _oContainerPages = new createjs.Container();
    _oContainerPages.x = BET_PANEL_X;
    _oContainerPages.y = BET_PANEL_Y;
    _oContainer.addChild(_oContainerPages);

    _aPages = new Array();
    _aPages[0] = new CSimpleBetPanel(0, 0, _oContainerPages);
    _aPages[1] = new CForecastPanel(BET_PANEL_WIDTH, 0, _oContainerPages);

    _oChipPanel = new CChipPanel(1010, 326, _oContainer);

    _oMaskPanel = new createjs.Shape();
    _oMaskPanel.graphics
      .beginFill('rgba(255,255,255,0.01)')
      .drawRect(
        BET_PANEL_X + 6,
        BET_PANEL_Y,
        BET_PANEL_WIDTH - 12,
        BET_PANEL_HEIGHT
      );
    _oContainer.addChild(_oMaskPanel);
    _oContainerPages.mask = _oMaskPanel;

    _iCurPage = 0;

    _oArrowLeft = new CGfxButton(
      BET_PANEL_X + 8,
      CANVAS_HEIGHT / 2,
      s_oSpriteLibrary.getSprite('arrow_left'),
      _oContainer
    );
    _oArrowLeft.addEventListener(ON_MOUSE_UP, this._onArrowLeft, this);

    _oArrowRight = new CGfxButton(
      BET_PANEL_X + oSpriteBg.width - 10,
      CANVAS_HEIGHT / 2,
      s_oSpriteLibrary.getSprite('arrow_right'),
      _oContainer
    );
    _oArrowRight.addEventListener(ON_MOUSE_UP, this._onArrowRight, this);

    _oMsgBox = new CMsgBox();
    s_oBetList.reset();

    this.refreshButtonPos();
  };

  this.unload = function () {
    _oArrowLeft.unload();
    _oArrowRight.unload();
    _oButExit.unload();
    if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
      _oAudioToggle.unload();
    }
    if (_fRequestFullScreen && screenfull.enabled) {
      _oButFullscreen.unload();
    }
    _oMsgBox.unload();

    _oChipPanel.unload();
    for (var i = 0; i < _aPages.length; i++) {
      _aPages[i].unload();
    }

    s_oStage.removeAllChildren();
  };

  this.refreshButtonPos = function () {
    if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
      _oAudioToggle.setPosition(
        _pStartPosAudio.x - s_iOffsetX,
        _pStartPosAudio.y + s_iOffsetY
      );
    }
    if (_fRequestFullScreen && screenfull.enabled) {
      _oButFullscreen.setPosition(
        _pStartPosFullscreen.x - s_iOffsetX,
        _pStartPosFullscreen.y + s_iOffsetY
      );
    }
    _oButExit.setPosition(
      _pStartPosExit.x - s_iOffsetX,
      _pStartPosExit.y + s_iOffsetY
    );
  };

  this.setChipSelected = function (iIndex) {
    _iChipSelected = iIndex;
  };

  this.setSimpleBet = function (iIndex, iPlace, iFicheValue, oBut) {
    if (_iTotBet + iFicheValue > MAX_BET) {
      //BET HIGHER THAN MAXIMUM ONE
      _oMsgBox.show(TEXT_ERR_MAX_BET);

      return false;
    }

    if (iFicheValue > s_iCurMoney) {
      //NOT ENOUGH MONEY FOR THIS BET
      _oMsgBox.show(TEXT_NO_MONEY);

      return false;
    }

    if (_horseselected == 0) {
      _horseselected = iIndex;
    } else if (_horseselected != iIndex) {
      _oMsgBox.show(TEXT_ONE_HORSE);

      return false;
    }

    s_oBetList.addSimpleBet(iIndex, iPlace, iFicheValue);

    _iTotBet += iFicheValue;
    _iTotBet = Number(_iTotBet.toFixed(2));
    s_iCurMoney -= iFicheValue;
    s_iCurMoney = parseFloat(s_iCurMoney.toFixed(2));
    s_iGameCash += iFicheValue;
    s_iGameCash = parseFloat(s_iGameCash.toFixed(2));
    _oChipPanel.refreshMoney();
    _oChipPanel.refreshBet(_iTotBet);

    _aHistory.push(oBut);

    return true;
  };

  this.setForecastBet = function (iFirst, iSecond, iFicheValue, oBut) {
    _oMsgBox.show(TEXT_ERR_FORECAST_NOT_AVAILABLE);

    return false;
  };

  this.refreshPagePos = function (iNextPage, iX) {
    _oContainerPages.x = BET_PANEL_X;
    _aPages[_iCurPage].setX(0);
    _aPages[iNextPage].setX(iX);
  };

  this.clearBet = function () {
    for (var i = 0; i < _aHistory.length; i++) {
      _aHistory[i].clearBet();
    }

    s_iCurMoney += _iTotBet;
    s_iCurMoney = parseFloat(s_iCurMoney.toFixed(2));
    s_iGameCash -= _iTotBet;
    s_iGameCash = parseFloat(s_iGameCash.toFixed());

    _iTotBet = 0;

    _aPages[0].clearBet();
    s_oBetList.reset();
    _oChipPanel.refreshBet(0);
    _oChipPanel.refreshMoney();

    _horseselected = 0;
  };

  this._onArrowLeft = function () {
    var iPrevPage = _iCurPage;
    _iCurPage++;
    if (_iCurPage === _aPages.length) {
      _iCurPage = 0;
      iPrevPage = _aPages.length - 1;
    }

    _aPages[_iCurPage].setX(BET_PANEL_WIDTH);
    createjs.Tween.get(_oContainerPages)
      .to({ x: -BET_PANEL_WIDTH + BET_PANEL_X }, 500, createjs.Ease.cubicOut)
      .call(function () {
        s_oBetPanel.refreshPagePos(iPrevPage, BET_PANEL_WIDTH);
      });
  };

  this._onArrowRight = function () {
    var iPrevPage = _iCurPage;
    _iCurPage--;
    if (_iCurPage < 0) {
      _iCurPage = _aPages.length - 1;
    }

    _aPages[_iCurPage].setX(-BET_PANEL_WIDTH);

    createjs.Tween.get(_oContainerPages)
      .to({ x: BET_PANEL_X + BET_PANEL_WIDTH }, 500, createjs.Ease.cubicOut)
      .call(function () {
        s_oBetPanel.refreshPagePos(iPrevPage, -BET_PANEL_WIDTH);
      });
  };

  this.onStartExit = async function () {
    if (_iTotBet < MIN_BET) {
      _oMsgBox.show(TEXT_ERR_MIN_BET);
    } else {
      // console.log('Bet amount: ' + _iTotBet);
      var horseNumber;
      var p1 = (p2 = p3 = 0);

      var bet1 = s_oBetList.getBetList();
      for (var i = 0; i < bet1.length; i++) {
        horseNumber = bet1[i].horses[0].index;
        if (bet1[i].horses[0].place == 1) {
          p1 += bet1[i].bet;
        }
        if (bet1[i].horses[0].place == 2) {
          p2 += bet1[i].bet;
        }
        if (bet1[i].horses[0].place == 3) {
          p3 += bet1[i].bet;
        }
      }

      // console.log(horseNumber + ' , ' +  p1 + ' , '+ p2+ ' , '+ p3);
      p1 *= 1000000;
      p2 *= 1000000;
      p3 *= 1000000;

      var betData = new Array();
      betData.push(horseNumber);
      betData.push(p1);
      betData.push(p2);
      betData.push(p3);
      // console.log(betData)

      try {
        let contractAddress = 'TVqdSYfGpPQXeBHQUgAAqqkgCiqmvQBY1p';
        var contractInfo = await tronWeb.trx.getContract(contractAddress);
        instance = await tronWeb.contract(
          contractInfo.abi.entrys,
          contractAddress
        );

        var value = _iTotBet * 1000000;
        let args = {
          callValue: value,
          shouldPollResponse: false,
        };

        var seed2 = Math.floor(Math.random() * 100000000 + 1);
        var uniqueString = Date.now() + seed2 + '';
        uniqueString = TronWeb.sha3(uniqueString, true);
        var seed3 = seed2 + uniqueString;
        playerSeed = TronWeb.sha3(seed3, true);

        let connection = await instance
          .GoodLuckWINNA(betData, playerSeed, uniqueString)
          .send(args);
        _oMsgBox.show(BET_PLACED);
        var check = setInterval(checkStatus, 1000);

        async function checkStatus() {
          try {
            var event = await tronWeb.getEventByTransactionID(connection);
            if (event.length >= 1) {
              var findIndex = event.findIndex(
                (eventArray) => eventArray.name === 'RaceResult'
              );
              if (findIndex != -1) {
                clear();
                var aRank = new Array();
                var leaderBoardencoded = event[findIndex].result.leaderBoard;

                aRank.push(parseInt('0x' + leaderBoardencoded.slice(513, 576)));
                aRank.push(parseInt('0x' + leaderBoardencoded.slice(577, 640)));
                aRank.push(parseInt('0x' + leaderBoardencoded.slice(641, 704)));
                aRank.push(parseInt('0x' + leaderBoardencoded.slice(705, 768)));
                aRank.push(parseInt('0x' + leaderBoardencoded.slice(769, 832)));
                aRank.push(parseInt('0x' + leaderBoardencoded.slice(833, 896)));
                aRank.push(parseInt('0x' + leaderBoardencoded.slice(897, 960)));
                aRank.push(
                  parseInt('0x' + leaderBoardencoded.slice(961, 1024))
                );
                console.log(aRank);

                s_oBetPanel.updateTronBalance();
                s_oBetPanel.unload();
                s_oMain.gotoGame(_iTotBet, aRank);
                $(s_oMain).trigger('bet_placed', _iTotBet);
              } else {
                clear();
                _oMsgBox.show(BET_TX_FAILED);
                s_oBetPanel.updateTronBalance();
                s_oBetPanel.clearBet();
              }
            }
            // var findIndex = event.findIndex(event.name == "RaceResult");
            // console.log(findIndex)

            // var status = await tronWeb.Tron.getTransactionInfo(connection);
            // console.log(status)
            // if(status){
            //     if(status.receipt.result == "SUCCESS"){
            //         clear();
            //         var aRank = new Array();
            //         var leaderBoard = status.contractResult[0];
            //         aRank.push(parseInt("0x"+leaderBoard.slice(128, 192)))
            //         aRank.push(parseInt("0x"+leaderBoard.slice(192, 256)))
            //         aRank.push(parseInt("0x"+leaderBoard.slice(256, 320)))
            //         aRank.push(parseInt("0x"+leaderBoard.slice(320, 384)))
            //         aRank.push(parseInt("0x"+leaderBoard.slice(384, 448)))
            //         aRank.push(parseInt("0x"+leaderBoard.slice(448, 512)))
            //         aRank.push(parseInt("0x"+leaderBoard.slice(512, 576)))
            //         aRank.push(parseInt("0x"+leaderBoard.slice(576, 640)))
            //         // console.log(aRank)

            //         s_oBetPanel.updateTronBalance();

            //         s_oBetPanel.unload();
            //         s_oMain.gotoGame(_iTotBet, aRank);
            //         $(s_oMain).trigger("bet_placed",_iTotBet);

            //     } else {
            //         clear();
            //         _oMsgBox.show(BET_TX_FAILED);
            //         s_oBetPanel.updateTronBalance();
            //         s_oBetPanel.clearBet();
            //     }
            // }
          } catch (error) {
            // console.log(error)
          }
        }
        function clear() {
          clearInterval(check);
        }
      } catch (e) {
        console.log('error in bet', e);
      }
    }
  };

  // setInterval(this.updateTronBalance, 3000)

  this.updateTronBalance = async function () {
    try {
      var TronBalance = await tronWeb.Tron.getBalance(
        TronWeb.defaultAddress.base58
      );
      s_iCurMoney = (TronBalance / 1000000).toFixed(2);
    } catch (e) {}
  };

  this.onExit = function () {
    $(s_oMain).trigger('end_session');
    this.unload();

    s_oMain.gotoMenu();
  };

  this._onAudioToggle = function () {
    Howler.mute(s_bAudioActive);
    s_bAudioActive = !s_bAudioActive;
  };

  this.resetFullscreenBut = function () {
    if (_fRequestFullScreen && screenfull.enabled) {
      _oButFullscreen.setActive(s_bFullscreen);
    }
  };

  this._onFullscreenRelease = function () {
    if (s_bFullscreen) {
      _fCancelFullScreen.call(window.document);
    } else {
      _fRequestFullScreen.call(window.document.documentElement);
    }

    sizeHandler();
  };

  this.getChipSelected = function () {
    return _iChipSelected;
  };

  s_oBetPanel = this;
  this._init();
}

var s_oBetPanel = null;
