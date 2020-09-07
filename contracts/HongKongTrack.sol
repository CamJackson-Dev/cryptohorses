pragma solidity ^0.5.4;
pragma experimental ABIEncoderV2;

/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {
    /**
     * @dev Multiplies two numbers, throws on overflow.
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }
        uint256 c = a * b;
        assert(c / a == b);
        return c;
    }

    /**
     * @dev Integer division of two numbers, truncating the quotient.
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        // assert(b > 0); // Solidity automatically throws when dividing by 0
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold
        return c;
    }

    /**
     * @dev Substracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a);
        return a - b;
    }

    /**
     * @dev Adds two numbers, throws on overflow.
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        assert(c >= a);
        return c;
    }
}

/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
    address public owner;
    address public server;
    bool public permenantTransfer = false;
    mapping(address => bool) public whitelist;

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    /**
     * @dev The Ownable constructor sets the original `owner` of the contract to the sender
     * account.
     */
    constructor() public {
        owner = msg.sender;
        server = msg.sender;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier onlyWhitelist() {
        require(
            whitelist[msg.sender] || msg.sender == owner || msg.sender == server
        );
        _;
    }

    modifier onlyOwnerOrServer() {
        require(msg.sender == owner || msg.sender == server);
        _;
    }

    /**
     * @dev Allows the current owner to transfer control of the contract to a newOwner.
     * @param newOwner The address to transfer ownership to.
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0) && !permenantTransfer);
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
        permenantTransfer = true;
    }

    function transferServerOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0));
        emit OwnershipTransferred(server, newOwner);
        server = newOwner;
    }
}

contract WinnaToken {
    function deposit(address player, uint256 betAmount) public payable;
}

contract HongKongTrack is Ownable {
    mapping(uint256 => betList) public bets;
    uint256 public curBet = 0;
    uint256 public processedBet = 0;
    address winnaAddress;
    event RaceResult(
        address player,
        uint256 betId,
        uint256[8] outcome,
        uint256 winnings
    );

    struct betList {
        uint256 amount;
        uint256[8] wins;
        uint256[8] place;
        uint256[8] show;
        uint256 time;
        address sender;
        address referralAddress;
    }

    uint256[8] winOdds = [
        3700000,
        5500000,
        2600000,
        11750000,
        17250000,
        8750000,
        7150000,
        6150000
    ];
    uint256[8] placeOdds = [
        1950000,
        2550000,
        1250000,
        5500000,
        7750000,
        3050000,
        2500000,
        2050000
    ];
    uint256[8] showOdds = [
        1250000,
        1700000,
        1090000,
        2550000,
        4000000,
        1750000,
        1550000,
        1350000
    ];

    constructor(address _winnaAddress) public {
        winnaAddress = _winnaAddress;
    }

    function setOddsWin(uint256[8] memory odds) public onlyOwnerOrServer {
        winOdds = odds;
    }

    function setOddsPlace(uint256[8] memory odds) public onlyOwnerOrServer {
        placeOdds = odds;
    }

    function setOddsShow(uint256[8] memory odds) public onlyOwnerOrServer {
        showOdds = odds;
    }

    function placeBet(
        uint256[8] memory wins,
        uint256[8] memory places,
        uint256[8] memory shows
    ) public payable {
        uint256 betSum = 0;
        for (uint256 x = 0; x < 8; x++) {
            betSum += wins[x];
            betSum += places[x];
            betSum += shows[x];
        }
        require(betSum <= msg.value, "Insufficient Funds Sent");
        require(betSum >= 10000000, "Bet Too Low");
        bets[curBet] = betList(msg.value, wins, places, shows, now, msg.sender);

        curBet++;
    }

    function concludeRaces(uint256[8] memory outcome) public onlyOwnerOrServer {
        //for(uint x = 0; x < outcome.length; x++){
        if (processedBet >= curBet) {
            return;
        } else {
            uint256 payout = 0;
            for (uint256 y = 0; y < 3; y++) {
                if (bets[processedBet].wins[outcome[y]] > 0 && y < 1) {
                    payout +=
                        (winOdds[outcome[y]] *
                            bets[processedBet].wins[outcome[y]]) /
                        1000000;
                }
                if (bets[processedBet].wins[outcome[y]] > 0 && y < 2) {
                    payout +=
                        (placeOdds[outcome[y]] *
                            bets[processedBet].place[outcome[y]]) /
                        1000000;
                }
                if (bets[processedBet].wins[outcome[y]] > 0) {
                    payout +=
                        (showOdds[outcome[y]] *
                            bets[processedBet].show[outcome[y]]) /
                        1000000;
                }
            }
            make_payable(bets[processedBet].sender).transfer(payout);
            emit RaceResult(
                bets[processedBet].sender,
                processedBet,
                outcome,
                payout
            );
            if (payout < bets[processedBet].amount) {
                WinnaToken(winnaAddress).deposit.value(
                    bets[processedBet].amount - payout
                )(bets[processedBet].sender, bets[processedBet].amount);
            }
            processedBet++;
        }
        //}
    }

    function make_payable(address x) internal pure returns (address payable) {
        return address(uint160(x));
    }
}
