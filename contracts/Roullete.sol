pragma solidity >= 0.5.0 < 0.6.0;
import "github.com/oraclize/ethereum-api/provableAPI.sol";

contract RinkebyRoullete is usingProvable {

    mapping (address => uint256) public accountBalance;
    address payable rouletteOwner;

    // All different types of payout multipliers
    uint[] winningsMultipliers;
    //acceptable specifics
    uint[] acceptableBetSpecifics;

    bool public betHasBeenMade;

    constructor() public {
        rouletteOwner = msg.sender;
        winningsMultipliers = [35, 11, 3, 2, 2];
        acceptableBetSpecifics = [36, 11 , 2, 1, 1];
        betHasBeenMade = false;
    }

    /* We are going to be handling 5 different kinds of bets:
    0. Straight up (35:1)
    1. Street or Row (11:1)
    2. Line or Column (3:1)
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

    Bet public currentBet;

    function placeBet(uint8 _bType, uint64 _bSpecifics) payable public  {
        require(betHasBeenMade == false);
        betHasBeenMade = true;
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

        accountBalance[msg.sender] = _bAmount;

    }

    function donateToHouse() payable public {
        require(msg.value > 1);
    }

    function cashOut() public payable{
        address payable sender = msg.sender;
        uint256 balance = accountBalance[sender];
        require(balance > 0);
        require(balance <= address(this).balance);
        accountBalance[sender] = 0;
        sender.transfer(balance);
  }

    function viewContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function houseCashOut() payable public {
        require(msg.sender == rouletteOwner);
        rouletteOwner.transfer(address(this).balance);
    }


    function roulleteRoll() public payable {
        require(msg.sender == currentBet.player);
        require(betHasBeenMade == true);

        emit LogNewProvableQuery("Provable query was sent, standing by for the answer...");
        provable_query("URL", "https://www.random.org/integers/?num=1&min=0&max=36&col=1&base=10&format=plain&rnd=new");

        //wait for randomNumber
        //rest is done in callback

    }

    function didWin() private view returns (bool) {
        if (currentBet.betType == 0) {
            if (randomNumber == currentBet.betSpecifics) { // striaght up
                return true;
            }
        } else if (currentBet.betType == 1) { // street or row

            if(randomNumber == 0) return false;
            if((randomNumber - 1) / 3 == currentBet.betSpecifics) return true;

        } else if (currentBet.betType == 2) { // column
            if (randomNumber % 3 == 1) { // first col
                if (currentBet.betSpecifics == 0) return true;
            }
            if (randomNumber % 3 == 2) { // second col
                if (currentBet.betSpecifics == 1) return true;
            }
            if (randomNumber % 3 == 0) { // third col
                return (currentBet.betSpecifics == 2);
            }
        } else if (currentBet.betType == 3) { // color
            if (currentBet.betSpecifics == 0) { // black
                if (randomNumber <= 10 || (randomNumber >= 20 && randomNumber <= 28)) {
                    return (randomNumber % 2 == 0);
                } else {
                    return (randomNumber % 2 == 1);
                }
            } else { // red
                if (randomNumber <= 10 || (randomNumber >= 20 && randomNumber <= 28)) {
                    return (randomNumber % 2 == 1);
                } else {
                    return (randomNumber % 2 == 0);
                }
            }
        } else if (currentBet.betType == 4) { // odd/even
            if( (currentBet.betSpecifics == 0) && (randomNumber % 2 == 0)) return true; // even
            else if ((currentBet.betSpecifics == 1) && (randomNumber % 2 == 1)) return true; // odd
        }
        return false;
    }

    //add events to emit
    // Leaving this public for testing. Will want to make non public after we are sure that random number generation works
    uint256 public randomNumber;

    event LogNewProvableQuery(string description);
    event LogNewRandomNumber(string number);

    event Winning(string description);
    event Losing(string description);

    function __callback(bytes32 _myid, string memory _result) public {
        require(msg.sender == provable_cbAddress());
        emit LogNewRandomNumber(_result);
        randomNumber = parseInt(_result);

        bool didUserWin = didWin();

        if (didUserWin) {
            uint256 winnings = currentBet.betAmount * winningsMultipliers[currentBet.betType];
            accountBalance[currentBet.player] = accountBalance[currentBet.player] + winnings - currentBet.betAmount;
            //subtracting original bet amount b/c it's added at the beginning of the round
            //emit event
            emit Winning("Congrats! You won! Your account balance has been updated!");
        } else {
            accountBalance[currentBet.player] = accountBalance[currentBet.player] - currentBet.betAmount;
            emit Losing("You lost. Better luck next time!");
        }

        betHasBeenMade = false;

    }
}
