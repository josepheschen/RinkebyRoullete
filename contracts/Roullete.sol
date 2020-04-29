pragma solidity ^0.5.16;
import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";

contract RinkebyRoullete is usingOraclize {

    mapping (address => uint256) public accountBalance;
    address payable rouletteOwner;

    // All different types of payout multipliers
    uint[] winningsMultipliers;
    //acceptable specifics
    uint[] acceptableBetSpecifics;

    constructor() public {
        rouletteOwner = msg.sender;
        winningsMultipliers = [35, 11, 5, 1, 1];
        acceptableBetSpecifics = [36, 11 , 2, 1, 1];
    }

    /* We are going to be handling 5 different kinds of bets:
    0. Straight up (35:1)
    1. Street or Row (11:1)
    2. Line or Column (5:1)
    3. Color (1:1)
    4. Odd/Even (1:1)

    We will also have an array named winningsMultipliers which is indexed the same as above for the appropriate payout multiplier.

    Each type will have a betSpecifics number associated with it:
    Straight up: betSpecifics = number
    Street or row: betSpecifics = row user is referencing (0 = 123, 1 = 456, etc.)
    Line or Column: betSpecifics = column user is referencing
    Color: betSpecifics = 0 for black, 1 for red
    Odd/Even: betSpecifics = 0 for even, 1 for odd
    */

    struct Bet {
        uint8 betType;
        uint256 betAmount;
        uint64 betSpecifics;
        address player;
    }

    Bet currentBet;
    bool public betHasBeenMade = false;
    
    // Leaving this public for testing. Will want to make non public after we are sure that random number generation works
    uint256 public randomNumber;
    
    event LogNewProvableQuery(string description);
    event LogNewRandomNumber(string number);

    function placeBet(uint8 _bType, uint64 _bSpecifics) payable public  {
        //first make sure there was no tampering with how much was paid and the call of the funtion tracking the amount
        //require(msg.value / 1000000000000000000 /* this is the eth to wei conversion, now our units are in ETH*/  == _bAmount);

        require(msg.value > 10000000000000000 /* this is 0.01 ETH */);
        uint256 _bAmount = msg.value;

        //make sure the betType is valid as well
        require(_bType >= 0 && _bType <= 4);
        //make sure the betSpecifics are also valid
        require(_bSpecifics >= 0 && _bSpecifics <= acceptableBetSpecifics[_bType]);


        currentBet = (Bet({
            betType: _bType,
            betAmount: _bAmount,
            betSpecifics: _bSpecifics,
            player: msg.sender
        }));
        betHasBeenMade = true;
        accountBalance[msg.sender] == _bAmount;

    }

    function donateToHouse() payable public {
        require(msg.value > 1);
    }

    function cashOut() public payable{
        address payable sender = msg.sender;
        uint256 ethBalance = accountBalance[sender];
        require(ethBalance > 0);
        require(ethBalance <= address(this).balance);
        accountBalance[sender] = 0;
        sender.transfer(ethBalance);
  }

    function viewContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function houseCashOut() payable public {
        require(msg.sender == rouletteOwner);
        rouletteOwner.transfer(address(this).balance);
    }


    function roulleteRoll() public {
        //make sure bet exists
        require(betHasBeenMade);

        betHasBeenMade = false;

        //get random number
        generateRandomNumber();
        //check to see if user has won


        //if they have, payout
        //if they didnt, put their account balance to 0, we already have the money because its part of the contract now

    }

    function __callback(bytes32 _myid, string memory _result) public{
        require(msg.sender == provable_cbAddress());
        emit LogNewRandomNumber(_result);
        randomNumber = parseInt(_result);
    }

    function generateRandomNumber() public payable {
        emit LogNewProvableQuery("Provable query was sent, standing by for the answer...");
        provable_query("URL", "https://www.random.org/integers/?num=1&min=0&max=36&col=1&base=10&format=plain&rnd=new");
    }


}
