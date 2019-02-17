pragma solidity >=0.4.25 <0.6.0;

contract City {
    struct Game {
        // a board size
        uint8 boardSize;
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
        // 0: undeveloped, 1: residential, 2: commercial, 3: industrial
        uint8 zone;
        // value declared by the player. Special case is val 0, which becomes 1.
        uint32 value;
    }

    // enum PlotType { Residential, Commercial, Industrial } -- garbage enum in solidity

    event GameCreated(uint indexed gameId, uint boardSize, uint partySize, uint joinLimitAt, uint buyIn);
    event Join(uint indexed gameId, address player);
    event GameStart(uint256 indexed gameId);
    event PlotSet(uint indexed gameId, uint round, address owner, uint8 x, uint8 y, uint8 zone);
    
    mapping(uint => Game) public games;
    uint public gameCount;

    int constant INIT_POINTS = 1000;
    uint8 constant UNDEVELOPED = 0;
    uint8 constant RESIDENTIAL = 1;
    uint8 constant COMMERCIAL = 2;
    uint8 constant INDUSTRIAL = 3;
    uint8[5] INCOME = [0, 1, 3, 6, 12];
    int8[2][4] NEIGHBORDELTAS = [[int8(-1), int8(0)], [int8(1), int8(0)], [int8(0), int8(-1)], [int8(0), int8(1)]];

    constructor() public {
        // what?
    }

    function createGame(uint _buyIn) public payable {
        require(_buyIn < 100 ether, "buy in too high");
        require(msg.value == _buyIn, "send balance");
        uint8 _boardSize = 5;
        Game memory game = Game({
            // TODO fix those arbitrary values
            boardSize: _boardSize,
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
        games[gameCount].balances[msg.sender] = INIT_POINTS;
        emit Join(gameCount, msg.sender);
        
        // _initBoard(boardId);
        emit GameCreated(gameCount, game.boardSize, game.partySize, game.joinLimitAt, game.buyIn);
    }

    function joinGame(uint gameId) public payable {
        Game storage game = games[gameId];
        require(game.boardSize > 1, "game doesnt exist");
        require(game.startedAt == 0, "cant join game started");
        require(game.balances[msg.sender] == 0, "cant join twice");
        require(game.buyIn == msg.value, "must pay exact buy in");

        game.players.push(msg.sender);
        // 1k initial balance!
        game.balances[msg.sender] = INIT_POINTS;
        emit Join(gameId, msg.sender);

        if (game.players.length == game.partySize) {
            game.startedAt = uint64(now);
            emit GameStart(gameId);
        }
    }

    /// @dev debug so we can set any cell
    function _setPlot(uint gameId, uint8 x, uint8 y, uint8 zone, address owner, uint32 price) public {
        Game storage game = games[gameId];
        require(game.boardSize > 1, "game doesnt exist");
        require(game.startedAt > 0, "game didnt start");
        require(price < INIT_POINTS * 10, "price over limit");
        require(game.balances[owner] > 0, "player is broke");
        
        // TODO some validation on the cell

        uint plotId = (y * game.boardSize) + x;
        game.plots[plotId] = Plot({
            owner: owner,
            zone: zone,
            value: price
        });
        
        uint8 round = 1;
        
        emit PlotSet(gameId, round, owner, x, y, zone);
    }

    function getPlot(uint gameId, uint8 x, uint8 y) public view returns (address, uint8, uint32) {
        Game storage game = games[gameId];
        require (game.boardSize > 0, "game doesnt exist");
        Plot storage plot = game.plots[(y * game.boardSize) + x];
        return (plot.owner, plot.zone, plot.value);
    }

    function calculateIncome(uint gameId) public {
        Game storage game = games[gameId];
        for (uint8 row = 0; row < game.boardSize; ++row) {
            for (uint8 col = 0; col < game.boardSize; ++col) {
                address player;
                uint8 zone;
                uint32 value;
                (player, zone, value) = getPlot(gameId, col, row);
                uint score = 0;
                for (uint8 neighborIndex = 0; neighborIndex < NEIGHBORDELTAS.length; ++neighborIndex) {
                    int8 deltaX = NEIGHBORDELTAS[neighborIndex][0];
                    int8 deltaY = NEIGHBORDELTAS[neighborIndex][1];
                    if ((deltaX >= 0 || col > 0) && (deltaX <= 0 || col < game.boardSize - 1) &&
                       (deltaY >= 0 || row > 0) && (deltaY <= 0 || row < game.boardSize - 1)) {
                        // This is a valid neighbor so get it...
                        address neighborPlayer;
                        uint8 neighborZone;
                        uint32 neighborValue;
                        (neighborPlayer, neighborZone, neighborValue) = getPlot(gameId, uint8(int8(col) + deltaX), uint8(int8(row) + deltaY));

                        // ... and apply neighborhood counting rules
                        if (zone == RESIDENTIAL && neighborZone == COMMERCIAL) {
                            score++;
                        } else if (zone == COMMERCIAL && neighborZone == INDUSTRIAL) {
                            score++;
                        } else if (zone == INDUSTRIAL && neighborZone == RESIDENTIAL) {
                            score++;
                        }
                    }
                }
                uint32 income = INCOME[score];
                game.balances[player] += income;
            }
        }
    }

    function getPlayers(uint gameId) external view returns (address[] memory, int[] memory) {
        Game storage game = games[gameId];
        address[] memory players = game.players;
        int[] memory balances = new int[](players.length);
        for (uint8 i = 0; i < players.length; ++i) {
            balances[i] = game.balances[players[i]];
        }
        return (players, balances);
    }

    // function _calcRules()

    // TODO -- this is the ideal scenario
    // function amount()...
    // // salt should not repeat among players and should change at least every round
    // function hashMyMove(uint gameId, uint round, uint landId, uint bid, bytes1 property, uint salt) public view returns (bytes32) {
    //     // TODO a simple hash over the params ABI packed
    // }
    // function submitMove(bytes32 moveHash) public {
    //     // calc the players moves
    // }

    // a non-authed version of the above!
    // function submitMove2(params...) {

    // }
}
