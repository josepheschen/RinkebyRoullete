contract RinkebyRoullete {

    uint betAmount;
    mapping (address => uint256) accountBalance;
    address roulleteOwner;
    uint[] winningsMultipliers;

    constructor() {
        roulleteOwner = msg.sender;
        winningsMultipliers = [35, 11, 5, 1, 1]
    }

    /* We are going to be handling 5 different kinds of bets:
    1. Straight up (35:1)
    2. Street or Row (11:1)
    3. Line or Column (5:1)
    4. Color (1:1)
    5. Odd/Even (1:1)

    We will also have an array named winningsMultipliers which is indexed the same as above for the appropriate payout multiplier.

    Each type will have a betSpecifics number associated with it:
    Straight up: betSpecifics = number
    Street or row: betSpecifics = row user is referencing (0 = 123, 1 = 456, etc.)
    Line or Column: betSpecifics = column user is referencing
    Color: betSpecifics = 0 for black, 1 for red
    Odd/Even: betSpecifics = 0 for even, 1 for odd
    */

    struct Bet {
        uint betType;
        uint betAmount;
        uint betSpecifics;
    }

    // A list of all bets placed on the current round
    Bet[] public bets;

}