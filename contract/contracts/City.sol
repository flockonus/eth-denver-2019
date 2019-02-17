pragma solidity >=0.4.25 <0.6.0;

contract City {
    struct Game {
        // a board size
        uint8 boardSize;
        // up to how many players the game MUST have
        uint8 partySize;
        // keep track of rounds, starting from 0
        uint8 round;
        // limit of time for all players to join a session
        uint64 joinLimitAt;
        // exact time the session stated, 0 means it didn't
        uint64 startedAt;
        // price in wei for players to join
        uint128 buyIn;
        // Count for how many players have finished bidding
        uint8 playersDoneBidding;
        // just a list of players
        address[] players;
        // plots of land
        mapping(uint => Plot) plots;
        // once players join they get a balance initialized to their wallet
        mapping(address => int) balances;
        // collect bids plotId -> top bid
        mapping(uint => Plot) bids;
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
    event NewRound(uint indexed gameId, uint round);
    event GameOver(uint indexed gameId);

    // DEBUG ONLY -- RM FROM PROD
    event DebugU(string label, uint val);

    mapping(uint => Game) public games;
    uint public gameCount;

    int constant INIT_POINTS = 1000;

    uint8 constant UNDEVELOPED = 0;
    uint8 constant RESIDENTIAL = 1;
    uint8 constant COMMERCIAL = 2;
    uint8 constant INDUSTRIAL = 3;

    uint8 constant REZONING_FEE = 5;
    uint8 constant TAX_RATE = 20; // %
    uint8 constant MAX_ROUNDS = 20;

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
            round: 0,
            // arbitrary limit
            joinLimitAt: uint64(now + 1 hours),
            startedAt: 0,
            buyIn: uint128(_buyIn),
            players: new address[](0),
            playersDoneBidding: 0
        });
        gameCount++;
        games[gameCount] = game;
        emit GameCreated(gameCount, game.boardSize, game.partySize, game.joinLimitAt, game.buyIn);

        games[gameCount].players.push(msg.sender);
        // 1k initial balance!
        games[gameCount].balances[msg.sender] = INIT_POINTS;
        // _initBoard(boardId);
        emit Join(gameCount, msg.sender);
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

    // This function is called by each client once the player has submitted all their bids (or timed out)
    // Once the last player submits their bids, taxes are charged and income is added (unless the game is over)
    function finishBidding(uint8 gameId, uint8 round) public returns (bool) {
        Game storage game = games[gameId];
        game.playersDoneBidding++;
        if (game.playersDoneBidding < game.players.length) {
            return false;
        }
        if (round < game.round) {
            // the round was already completed
            return true;
        }
        // Ready to move on
        emit DebugU("Moving on with the round...", 0);
        _resolveBids(gameId);
        subtractTaxes(gameId);
        game.round++;
        game.playersDoneBidding = 0;
        if (game.round < MAX_ROUNDS) {
            addIncome(gameId);
            emit NewRound(gameId, game.round);
            emit DebugU("New round starting: ", game.round);
        } else {
            emit GameOver(gameId);
            emit DebugU("Game over", 0);
        }
        return true;
        // else game over!
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

    /// @notice any player can put a bid for that round, only the top one per square will stay
    function bid(uint gameId, uint8 x, uint8 y, uint8 zone, uint32 price) external {
        Game storage game = games[gameId];
        require(game.boardSize > 1, "game doesnt exist");
        require(game.startedAt > 0, "game didnt start");
        require(price < INIT_POINTS * 10, "price over limit");
        require(game.balances[msg.sender] > price, "balance cant go negative");

        uint plotId = (y * game.boardSize) + x;
        Plot storage plot = game.plots[plotId];

        Plot storage currentBid = game.bids[plotId];
        bool applyBid = false;

        // we should allow bids that may be less than the current plot price
        //   because the owner may be lowering the price of the plot at that time

        // incoming bid is higher than an existing bid (if any)
        if (price > currentBid.value) {
            // silently discard possible existing bid
            applyBid = true;
        } else if (price == currentBid.value) {
            if (currentBid.owner == plot.owner) {
                // If bids are even the owner takes precedence
                applyBid = true;
            } else {
                // Two even bids, neither of whom is the plot's owner: randomly choose one
                uint rand = uint(blockhash(block.number - 1)) % 2;
                applyBid = (rand == 1);
                if (applyBid) emit DebugU("coinflip won! value: ", price);
            }
        } else {
            emit DebugU("bid was less than existing bid, existing value: ", currentBid.value);
            emit DebugU("bid was less than existing bid, current value: ", price);
        }
        if (applyBid) {
            game.bids[plotId] = Plot({
                owner: msg.sender,
                zone: zone,
                value: price
            });
            emit DebugU("leading bid placed, plotId: ", plotId);
            emit DebugU("leading bid placed, value: ", price);
        } else {
            // TODO maybe revert the loser bid?
            emit DebugU("bid failed, plotId: ", plotId);
            emit DebugU("bid failed, value: ", price);
        }

        // maybe we should check user balance here BUT that would require a full round simulation, so nevermind.
    }

    /// @dev run through all the bids for current round, and update the grid
    function _resolveBids(uint gameId) public {
        Game storage game = games[gameId];
        require(game.boardSize > 1, "game doesnt exist");
        require(game.startedAt > 0, "game didnt start");

        for (uint8 y = 0; y < game.boardSize; y++) {
            for (uint8 x = 0; x < game.boardSize; x++) {
                uint32 plotId = (y * game.boardSize) + x;
                emit DebugU("Resolving bids for plotId: ", plotId);

                Plot storage _bid = game.bids[plotId];

                if (_bid.value > 0) {
                    emit DebugU("  bid:", _bid.value);
                    Plot storage plot = game.plots[plotId];

                    if (_bid.value > plot.value) {
                        emit DebugU("  bid won; old value: ", plot.value);
                        emit DebugU("  bid won; old zone: ", plot.zone);
                        emit DebugU("  bid won; new value: ", _bid.value);
                        emit DebugU("  bid won; new zone: ", _bid.zone);
                        if (plot.zone != _bid.zone && plot.zone != UNDEVELOPED) {
                            game.balances[_bid.owner] -= REZONING_FEE;
                            emit DebugU("  Rezoning from: ", game.plots[plotId].zone);
                            emit DebugU("  Rezoning to: ", _bid.zone);
                            emit DebugU("  Rezoning fee paid, new balance: ", uint(game.balances[_bid.owner]));
                        }
                        if (plot.owner != _bid.owner && plot.zone != UNDEVELOPED) {
                            // Property changed hands and so must money
                            game.balances[plot.owner] += _bid.value;
                            game.balances[_bid.owner] -= _bid.value;
                            emit DebugU("  money transferred, value: ", _bid.value);
                            emit DebugU("  money transferred, old owner balance: ", uint(game.balances[plot.owner]));
                            emit DebugU("  money transferred, new owner balance: ", uint(game.balances[_bid.owner]));
                        }
                        // Replace the plot
                        game.plots[plotId] = Plot({
                            owner: _bid.owner,
                            zone: _bid.zone,
                            value: _bid.value
                        });
                    } else if (plot.owner == _bid.owner) {
                        // Owner successfully reduced the price of their plot
                        emit DebugU("  Price reduction from: ", game.plots[plotId].value);
                        emit DebugU("  Price reduction to: ", _bid.value);
                        if (plot.zone != _bid.zone && plot.zone != UNDEVELOPED) {
                            game.balances[plot.owner] -= REZONING_FEE;
                            emit DebugU("  Rezoning from: ", game.plots[plotId].zone);
                            emit DebugU("  Rezoning to: ", _bid.zone);
                            emit DebugU("  Rezoning fee paid, new balance: ", uint(game.balances[plot.owner]));
                        }
                        game.plots[plotId].value = _bid.value;
                        game.plots[plotId].zone = _bid.zone;
                    } else {
                        emit DebugU("  bid lost", _bid.value);
                    }
                    delete game.bids[plotId];
                }
            }
        }
    }

    function addIncome(uint gameId) public {
        Game storage game = games[gameId];
        for (uint8 row = 0; row < game.boardSize; ++row) {
            for (uint8 col = 0; col < game.boardSize; ++col) {
                address player;
                uint32 income;
                (player, income) = getPlotIncome(gameId, col, row);
                game.balances[player] += income;
            }
        }
    }

    function subtractTaxes(uint gameId) public {
        Game storage game = games[gameId];
        for (uint8 row = 0; row < game.boardSize; ++row) {
            for (uint8 col = 0; col < game.boardSize; ++col) {
                address player;
                uint8 zone;
                uint32 value;
                (player, zone, value) = getPlot(gameId, col, row);
                emit DebugU("Calculating tax on plotId: ", (row * game.boardSize) + col);
                uint32 tax = calculatePlotTax(value, zone);
                emit DebugU("Value is: ", value);
                emit DebugU("Tax is: ", tax);
                game.balances[player] -= tax;
            }
        }
    }

    function getPlotIncome(uint gameId, uint8 col, uint8 row) public view returns (address owner, uint32 income) {
        uint8[5] memory INCOME = [0, 1, 3, 6, 12];
        address player;
        uint8 zone;
        uint32 value;
        (player, zone, value) = getPlot(gameId, col, row);

        uint score = 0;
        //emit DebugU("Checking neighbors for plotID: ", (row * game.boardSize) + col);
        score += countValuableNeighbors(gameId, zone, col, row);

        income = INCOME[score];
        //emit DebugU("Total income: ", income);
        return (player, income);
    }

    function getFullPlotInfo(uint gameId, uint8 col, uint8 row) public view
        returns (address owner, uint32 value, uint8 zone, uint32 income, uint32 tax) {
        address player;
        (player, zone, value) = getPlot(gameId, col, row);
        (player, income) = getPlotIncome(gameId, col, row);
        tax = calculatePlotTax(value, zone);
        /*
        emit DebugU("getFullPlotInfo for plotId: ", (row * game.boardSize) + col);
        emit DebugU("  player: ", 0);
        emit DebugU("  value: ", value);
        emit DebugU("  zone: ", zone);
        emit DebugU("  income: ", income);
        emit DebugU("  tax: ", tax);
        */
        return (player, value, zone, income, tax);
    }

    function calculatePlotTax(uint32 value, uint8 zone) internal pure returns (uint32) {
        uint32 tax = value * uint32(TAX_RATE) / 100;
        if (zone != UNDEVELOPED && value > 0 && tax == 0) {
            // Hack to make tax minimum 1
            //emit DebugU("min tax imposed: ", 1);
            tax = 1;
        }
        return tax;
    }

    function countValuableNeighbors(uint gameId, uint8 zone, uint8 col, uint8 row) internal view returns (uint8) {
        int8[2][4] memory NEIGHBORDELTAS = [[int8(-1), int8(0)], [int8(1), int8(0)], [int8(0), int8(-1)], [int8(0), int8(1)]];
        uint8 score = 0;
        Game storage game = games[gameId];

        for (uint8 neighborIndex = 0; neighborIndex < NEIGHBORDELTAS.length; ++neighborIndex) {
            int8 deltaX = NEIGHBORDELTAS[neighborIndex][0];
            int8 deltaY = NEIGHBORDELTAS[neighborIndex][1];
            if ((deltaX >= 0 || col > 0) && (deltaX <= 0 || col < game.boardSize - 1) &&
                (deltaY >= 0 || row > 0) && (deltaY <= 0 || row < game.boardSize - 1)) {
                // This is a valid neighbor so get it...
                address neighborPlayer;
                uint8 neighborZone;
                uint32 neighborValue;
                (neighborPlayer, neighborZone, neighborValue) = getPlot(gameId, uint8(deltaX + int8(col)), uint8(deltaY + int8(row)));
                //emit DebugU("  neighbor plotId: ", (uint8(deltaY + int8(row)) * game.boardSize) + uint8(deltaX + int8(col)));
                //emit DebugU("  zone: ", zone);
                //emit DebugU("  neighborZone: ", neighborZone);

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
        //emit DebugU("  score: ", score);
        return score;
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
