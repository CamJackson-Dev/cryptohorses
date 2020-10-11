pragma solidity ^0.5.4;

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

/**
 * @title ERC20Basic
 * @dev Simpler version of ERC20 interface
 * @dev see https://github.com/ETHEREUMereum/EIPs/issues/179
 */
contract ERC20Basic {
    function totalSupply() public view returns (uint256);

    function balanceOf(address who) public view returns (uint256);

    function transfer(address to, uint256 value) public returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
}

/**
 * @title ERC20 interface
 * @dev see https://github.com/ETHEREUMereum/EIPs/issues/20
 */
contract ERC20 is ERC20Basic {
    function allowance(address owner, address spender)
        public
        view
        returns (uint256);

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) public returns (bool);

    function approve(address spender, uint256 value) public returns (bool);

    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

/**
 * @title Basic token
 * @dev Basic version of StandardToken, with no allowances.
 */
contract BasicToken is ERC20Basic {
    using SafeMath for uint256;

    mapping(address => uint256) balances;

    uint256 totalSupply_;

    /**
     * @dev total number of tokens in existence
     */
    function totalSupply() public view returns (uint256) {
        return totalSupply_;
    }

    /**
     * @dev transfer token for a specified address
     * @param _to The address to transfer to.
     * @param _value The amount to be transferred.
     */
    function transfer(address _to, uint256 _value) public returns (bool) {
        require(_to != address(0));
        require(_value <= balances[msg.sender]);

        // SafeMath.sub will throw if there is not enough balance.
        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    /**
     * @dev Gets the balance of the specified address.
     * @param _owner The address to query the the balance of.
     * @return An uint256 representing the amount owned by the passed address.
     */
    function balanceOf(address _owner) public view returns (uint256 balance) {
        return balances[_owner];
    }
}

/**
 * @title Standard ERC20 token
 *
 * @dev Implementation of the basic standard token.
 * @dev https://github.com/ETHEREUMereum/EIPs/issues/20
 * @dev Based on code by FirstBlood: https://github.com/Firstbloodio/token/blob/master/smart_contract/FirstBloodToken.sol
 */
contract StandardToken is ERC20, BasicToken {
    mapping(address => mapping(address => uint256)) internal allowed;

    /**
     * @dev Transfer tokens from one address to another
     * @param _from address The address which you want to send tokens from
     * @param _to address The address which you want to transfer to
     * @param _value uint256 the amount of tokens to be transferred
     */
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool) {
        require(_to != address(0));
        require(_value <= balances[_from]);
        require(_value <= allowed[_from][msg.sender]);

        balances[_from] = balances[_from].sub(_value);
        balances[_to] = balances[_to].add(_value);
        allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
        emit Transfer(_from, _to, _value);
        return true;
    }

    /**
     * @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
     *
     * Beware that changing an allowance with this mETHEREUMod brings the risk that someone may use both the old
     * and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this
     * race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards:
     * https://github.com/ETHEREUMereum/EIPs/issues/20#issuecomment-263524729
     * @param _spender The address which will spend the funds.
     * @param _value The amount of tokens to be spent.
     */
    function approve(address _spender, uint256 _value) public returns (bool) {
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    /**
     * @dev Function to check the amount of tokens that an owner allowed to a spender.
     * @param _owner address The address which owns the funds.
     * @param _spender address The address which will spend the funds.
     * @return A uint256 specifying the amount of tokens still available for the spender.
     */
    function allowance(address _owner, address _spender)
        public
        view
        returns (uint256)
    {
        return allowed[_owner][_spender];
    }

    /**
     * @dev Increase the amount of tokens that an owner allowed to a spender.
     *
     * approve should be called when allowed[_spender] == 0. To increment
     * allowed value is better to use this function to avoid 2 calls (and wait until
     * the first transaction is mined)
     * From MonolithDAO Token.sol
     * @param _spender The address which will spend the funds.
     * @param _addedValue The amount of tokens to increase the allowance by.
     */
    function increaseApproval(address _spender, uint256 _addedValue)
        public
        returns (bool)
    {
        allowed[msg.sender][_spender] = allowed[msg.sender][_spender].add(
            _addedValue
        );
        emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }

    /**
     * @dev Decrease the amount of tokens that an owner allowed to a spender.
     *
     * approve should be called when allowed[_spender] == 0. To decrement
     * allowed value is better to use this function to avoid 2 calls (and wait until
     * the first transaction is mined)
     * From MonolithDAO Token.sol
     * @param _spender The address which will spend the funds.
     * @param _subtractedValue The amount of tokens to decrease the allowance by.
     */
    function decreaseApproval(address _spender, uint256 _subtractedValue)
        public
        returns (bool)
    {
        uint256 oldValue = allowed[msg.sender][_spender];
        if (_subtractedValue > oldValue) {
            allowed[msg.sender][_spender] = 0;
        } else {
            allowed[msg.sender][_spender] = oldValue.sub(_subtractedValue);
        }
        emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }
}

// /**
//  * @title Mintable token
//  * @dev Simple ERC20 Token example, with mintable token creation
//  * @dev Issue: * https://github.com/OpenZeppelin/zeppelin-solidity/issues/120
//  * Based on code by TokenMarketNet: https://github.com/TokenMarketNet/ico/blob/master/contracts/MintableToken.sol
//  */
// contract MintableToken is StandardToken, Ownable {
//   event Mint(address indexed to, uint256 amount);
//   event MintFinished();

//   bool public mintingFinished = false;

//   modifier canMint() {
//     require(!mintingFinished);
//     _;
//   }

//   /**
//    * @dev Function to mint tokens
//    * @param _to The address that will receive the minted tokens.
//    * @param _amount The amount of tokens to mint.
//    * @return A boolean that indicates if the operation was successful.
//    */
//   function mint(address _to, uint256 _amount) onlyWhitelist public returns (bool) {
//     totalSupply_ = totalSupply_.add(_amount);
//     balances[_to] = balances[_to].add(_amount);
//     emit Mint(_to, _amount);
//     emit Transfer(address(0), _to, _amount);
//     return true;
//   }

//   /**
//    * @dev Function to stop minting new tokens.
//    * @return True if the operation was successful.
//    */
//   function finishMinting() onlyOwner canMint public returns (bool) {
//     mintingFinished = true;
//     emit MintFinished();
//     return true;
//   }
// }

contract Erc20Token is MintableToken {
    /*
     * Token meta data
     */
    string public name;
    string public symbol;
    uint8 public constant decimals = 6;

    /*
    function multiMint(address[] recipients, uint256[] values) onlyOwner external {
        require(recipients.length == values.length);
        for (uint256 i = 0; i < recipients.length; i++) {
          if(recipients[i] != address(0))
            mint(recipients[i], values[i]);
        }
    }*/
}

contract WinnaToken is Ownable, Erc20Token {
    uint256 public currentStage = 1;
    mapping(address => frozenData) public frozen;
    mapping(address => uint256) public claim;
    mapping(address => uint256) public totalBet;

    uint256 public miningInterval = 20000000;
    uint256 public miningDays = 0;

    uint256[] private miningDifficultyArray = [
        100000000,
        120000000,
        140000000,
        160000000,
        180000000,
        200000000,
        220000000,
        240000000,
        260000000,
        280000000,
        300000000,
        320000000,
        340000000,
        360000000,
        380000000,
        400000000,
        420000000,
        440000000,
        460000000,
        480000000,
        500000000,
        520000000,
        540000000,
        560000000,
        580000000
    ];

    uint256[] public refBounds = [
        //ETHEREUM spent for each level - each value should be higher than the last (cumulative)
        1000000,
        5000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000,
        1000000
    ];

    uint256[10] refRewards = [100, 101, 102, 103, 104, 105, 106, 107, 108, 110]; //percentage point increase in mining rewards per 10 levels.

    uint256 public freezeCoolDown = 0 minutes;

    uint256 public releaseInterval = 1 days;
    uint256 public releaseDate = now + 1 days;

    uint256 adminBalance = 0;

    uint256 referralCount = 5000100;
    mapping(uint256 => address) public referralOwners;
    mapping(address => uint256) public referralClaim;
    mapping(address => uint256) public referralUsers;
    mapping(address => uint256) public referralWithdrawn;
    mapping(address => uint256) public referralLinks;
    mapping(address => address) public referee;

    mapping(uint256 => dividendStage) public stages;

    struct dividendStage {
        uint256 totalFrozen;
        uint256 stageBalance;
    }

    struct frozenData {
        uint256 amount;
        uint256 stage;
        uint256 time;
    }

    constructor() public {
        name = "WINNA Token";
        symbol = "WINNA";
        owner = msg.sender; //_owner;
    }

    function stringToBytes32(string memory source)
        public
        returns (bytes32 result)
    {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(source, 32))
        }
    }

    function setCoolDown(uint256 time) public onlyOwner {
        freezeCoolDown = time;
    }

    function setReleaseInterval(uint256 time) public onlyOwner {
        releaseInterval = time;
    }

    function addToWhitelist(address ad) public onlyOwnerOrServer {
        whitelist[ad] = !whitelist[ad];
    }

    function deposit() public payable {
        stages[currentStage].stageBalance = stages[currentStage]
            .stageBalance
            .add(msg.value);
    }

    function deposit(address player, uint256 betAmount) public payable {
        require(whitelist[msg.sender]);
        totalBet[player] = totalBet[player].add(betAmount);
        uint256 _amount = betAmount.mul(1000000).div(
            miningDifficultyArray[currentStage]
        );
        _amount = _amount.mul(refRewards[getLevel(player) / 10]).div(100);
        totalSupply_ = totalSupply_.add(_amount);
        balances[player] = balances[player].add(_amount);
        emit Mint(player, _amount);
        emit Transfer(address(0), player, _amount);

        stages[currentStage].stageBalance = stages[currentStage]
            .stageBalance
            .add(msg.value.mul(4).div(10));
        adminBalance += msg.value.mul(6).div(10);
    }

    function addStage() public returns (bool) {
        require(releaseDate < now);
        currentStage++;
        stages[currentStage] = dividendStage(
            stages[currentStage - 1].totalFrozen,
            0
        );
        releaseDate = now + releaseInterval;
        return true;
    }

    function freeze(uint256 amount) public {
        require(amount <= balances[msg.sender]);
        balances[msg.sender] = balances[msg.sender].sub(amount);
        updateClaim(msg.sender);
        frozen[msg.sender].amount = frozen[msg.sender].amount.add(amount);
        frozen[msg.sender].time = now;
        stages[currentStage].totalFrozen = stages[currentStage].totalFrozen.add(
            amount
        );
    }

    function unfreeze(uint256 amount) public {
        require(
            frozen[msg.sender].time + freezeCoolDown < now &&
                frozen[msg.sender].amount >= amount
        );
        updateClaim(msg.sender);
        frozen[msg.sender].amount = frozen[msg.sender].amount.sub(amount);
        balances[msg.sender] = balances[msg.sender].add(amount);
        stages[currentStage].totalFrozen = stages[currentStage].totalFrozen.sub(
            amount
        );
    }

    function updateClaim(address ad) public {
        uint256 payout = 0;
        if (frozen[ad].stage == 0 || frozen[ad].amount == 0) {
            frozen[ad].stage = currentStage;
        }
        if (frozen[msg.sender].stage < currentStage) {
            for (uint256 x = frozen[ad].stage; x < currentStage; x++) {
                if (stages[x].totalFrozen != 0) {
                    uint256 stagePayout = frozen[ad]
                        .amount
                        .mul(stages[x].stageBalance)
                        .div(stages[x].totalFrozen);
                    payout = payout.add(stagePayout);
                }
            }
            claim[ad] = claim[ad].add(payout);
            frozen[ad].stage = currentStage;
        }
    }

    function updateClaimSafe(address ad) public {
        uint256 payout = 0;
        if (frozen[ad].stage == 0 || frozen[ad].amount == 0) {
            frozen[ad].stage = currentStage;
        }
        if (frozen[msg.sender].stage + 10 < currentStage) {
            for (uint256 x = frozen[ad].stage; x < frozen[ad].stage + 10; x++) {
                if (stages[x].totalFrozen != 0) {
                    uint256 stagePayout = frozen[ad]
                        .amount
                        .mul(stages[x].stageBalance)
                        .div(stages[x].totalFrozen);
                    payout = payout.add(stagePayout);
                }
            }
            claim[ad] = claim[ad].add(payout);
            frozen[ad].stage = frozen[ad].stage + 10;
        }
    }

    function getClaim(address user) public view returns (uint256) {
        uint256 payout = 0;
        if (frozen[user].stage == 0 || frozen[user].amount == 0) {
            payout = 0;
        } else if (frozen[msg.sender].stage < currentStage) {
            for (uint256 x = frozen[user].stage; x < currentStage; x++) {
                if (stages[x].totalFrozen != 0) {
                    uint256 stagePayout = frozen[user]
                        .amount
                        .mul(stages[x].stageBalance)
                        .div(stages[x].totalFrozen);
                    payout = payout.add(stagePayout);
                }
            }
        }
        return claim[user] + payout;
    }

    function withdrawClaim(uint256 amount) public {
        updateClaim(msg.sender);
        require(claim[msg.sender] >= amount);
        claim[msg.sender] = claim[msg.sender].sub(amount);
        msg.sender.transfer(amount);
    }

    function getLevel(address player) public returns (uint256 level) {
        for (uint256 x = 0; x < 100; x++) {
            if (totalBet[player] < refBounds[x]) {
                return (x + 1);
            }
        }
        return 0;
    }

    function createLink() public {
        require(referralLinks[msg.sender] == 0, "You already have a link");
        referralLinks[msg.sender] = referralCount;
        referralOwners[referralCount] = msg.sender;
        referralCount++;
    }

    function withdrawReferral() public {
        require(0 < referralClaim[msg.sender]);
        msg.sender.transfer(referralClaim[msg.sender]);
        referralWithdrawn[msg.sender] += referralClaim[msg.sender];
        referralClaim[msg.sender] = 0;
    }

    function addToClaim(address user, uint256 amount) public onlyOwnerOrServer {
        referralClaim[referee[user]] += amount;
    }

    function adminWithdraw() public onlyOwner {
        msg.sender.transfer(adminBalance);
        adminBalance = 0;
    }
}
