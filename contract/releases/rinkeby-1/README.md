Rinkeby: 

0x04d9c9017e3c531598c9e81cb0b03b560e477f57

[
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "games",
    "outputs": [
      {
        "name": "boardSize",
        "type": "uint8"
      },
      {
        "name": "partySize",
        "type": "uint8"
      },
      {
        "name": "round",
        "type": "uint8"
      },
      {
        "name": "joinLimitAt",
        "type": "uint64"
      },
      {
        "name": "startedAt",
        "type": "uint64"
      },
      {
        "name": "buyIn",
        "type": "uint128"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "gameCount",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "gameId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "boardSize",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "partySize",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "joinLimitAt",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "buyIn",
        "type": "uint256"
      }
    ],
    "name": "GameCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "gameId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "player",
        "type": "address"
      }
    ],
    "name": "Join",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "gameId",
        "type": "uint256"
      }
    ],
    "name": "GameStart",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "gameId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "round",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "x",
        "type": "uint8"
      },
      {
        "indexed": false,
        "name": "y",
        "type": "uint8"
      },
      {
        "indexed": false,
        "name": "zone",
        "type": "uint8"
      }
    ],
    "name": "PlotSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "label",
        "type": "string"
      },
      {
        "indexed": false,
        "name": "val",
        "type": "uint256"
      }
    ],
    "name": "DebugU",
    "type": "event"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_buyIn",
        "type": "uint256"
      }
    ],
    "name": "createGame",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256"
      }
    ],
    "name": "joinGame",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256"
      },
      {
        "name": "x",
        "type": "uint8"
      },
      {
        "name": "y",
        "type": "uint8"
      },
      {
        "name": "zone",
        "type": "uint8"
      },
      {
        "name": "owner",
        "type": "address"
      },
      {
        "name": "price",
        "type": "uint32"
      }
    ],
    "name": "_setPlot",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256"
      },
      {
        "name": "x",
        "type": "uint8"
      },
      {
        "name": "y",
        "type": "uint8"
      }
    ],
    "name": "getPlot",
    "outputs": [
      {
        "name": "",
        "type": "address"
      },
      {
        "name": "",
        "type": "uint8"
      },
      {
        "name": "",
        "type": "uint32"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256"
      },
      {
        "name": "x",
        "type": "uint8"
      },
      {
        "name": "y",
        "type": "uint8"
      },
      {
        "name": "zone",
        "type": "uint8"
      },
      {
        "name": "price",
        "type": "uint32"
      }
    ],
    "name": "bid",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256"
      }
    ],
    "name": "_resolveBids",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256"
      }
    ],
    "name": "calculateIncome",
    "outputs": [],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "gameId",
        "type": "uint256"
      }
    ],
    "name": "getPlayers",
    "outputs": [
      {
        "name": "",
        "type": "address[]"
      },
      {
        "name": "",
        "type": "uint32[]"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
]