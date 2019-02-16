pragma solidity >=0.4.25 <0.6.0;

contract City {
    struct Game {
        // a board size
        uint8 size;
        // up to how many players the game MUST have
        uint8 partySize;
        // limit of time for all players to join a session
        uint64 joinLimitAt;
        // exact time the session stated, 0 means it didn't
        uint64 startedAt;
        // price in wei for players to join
        uint128 buyIn;
        // just a list of players
        address[] players;
        // plots of land
        mapping(uint => Plot) plots;
        // once players join they get a balance initialized to their wallet
        mapping(address => int) balances;
    }

    // all plots start owned by 0x0, and they are Residence, of value 1
    struct Plot {
        address owner;
        PlotType property;
        // value declared by the player. Special case is val 0, which becomes 1.
        uint32 value;
    }

    enum PlotType { Residential, Commercial, Industrial }
    
    mapping(uint => Game) public games;
    uint public gameCount;

    constructor() public {
        // what?
    }

    function createGame(uint _buyIn) public payable {
        require(_buyIn < 100 ether, "buy in too high");
        require(msg.value == _buyIn, "send balance");
        uint8 _size = 4;
        Game memory game = Game({
            // TODO fix those arbitrary values
            size: _size,
            partySize: 2,
            // arbitrary limit
            joinLimitAt: uint64(now + 1 hours),
            startedAt: 0,
            buyIn: uint128(_buyIn),
            players: new address[](0)
        });
        gameCount++;
        games[gameCount] = game;
        games[gameCount].players.push(msg.sender);
        // 1k initial balance!
        games[gameCount].balances[msg.sender] = 1000;
        // _initBoard(boardId);
    }

    // function _initBoard(uint boardId) internal {
    //     games[boardId]
    // }

    function joinGame() public {
        // check if game hasnt started yet
        // add player to array
        // if player is last to join then start the game!
    }

    // TODO -- this is the ideal scenario
    // // salt should not repeat among players and should change at least every round
    // function hashMyMove(uint gameId, uint round, uint landId, uint bid, bytes1 property, uint salt) public view returns (bytes32) {
    //     // TODO a simple hash over the params ABI packed
    // }
    // function submitMove(bytes32 moveHash) public {
    //     // calc the players moves
    // }

    // a non-authed version of the above!
    function submitMove2(params...) {

    }
}
