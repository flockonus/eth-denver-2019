const City = artifacts.require('City');

function ppLogs(tx) {
  const { logs } = tx;
  console.log('logs:', logs.map((l) => ({ label: l.event, arg: l.args })));
}

const ZONES = {
  UNDEVELOPED: 0,
  RESIDENTIAL: 1,
  COMMERCIAL: 2,
  INDUSTRIAL: 3,
};

function cropAddress(addr) {
  return '..' + addr.substring(39);
}

// a plot obj from SC
function ppPlot(plot) {
  let zone = 'U';
  if (plot[1].eq(1)) zone = 'R';
  if (plot[1].eq(2)) zone = 'C';
  if (plot[1].eq(3)) zone = 'I';

  return `${cropAddress(plot[0])} | ${zone} | ${plot[2].toNumber()}`;
}

async function debugBoard(gameId, city) {
  for (let x = 0; x < 5; x++) {
    for (let y = 0; y < 5; y++) {
      const plot = await city.getPlot(gameId, x, y);
      console.log(`[${x}, ${y}]`, 'plot', ppPlot(plot));
    }
  }
}

async function debugPlayers(gameId, city) {
    let players = [];
    let balances = [];
    console.log(`Players and balances:`);
    const playerinfo = await city.getPlayers(gameId);
    for (let i = 0; i < playerinfo[0].length; ++i) {
      console.log(`player ${playerinfo[0][i]}; balance ${playerinfo[1][i]}`);
    }

}

contract('City', (accounts) => {
  let city;
  const p1 = accounts[0];
  const p2 = accounts[1];
  const p3 = accounts[2];

  before(async function() {
    city = await City.new();
  });

  it('createGame', async function() {
    // create a game and stake
    const tx = await city.createGame(1, { value: 1, from: p1 });
    // ppLogs(tx); // looking good! Join + GameCreated
  });

  it('join game & start it', async function() {
    const tx = await city.joinGame(1, { value: 1, from: p2 });
    // ppLogs(tx); // looking good! Join + GameStart
  });

  it('set some plots', async function() {
    //
    let tx;
    tx = await city._setPlot(1, 1, 1, ZONES.RESIDENTIAL, p2, 4);
    tx = await city._setPlot(1, 1, 2, ZONES.RESIDENTIAL, p1, 5);
    tx = await city._setPlot(1, 2, 1, ZONES.COMMERCIAL, p2, 6);
    tx = await city._setPlot(1, 2, 2, ZONES.INDUSTRIAL, p1, 3);
    tx = await city._setPlot(1, 2, 3, ZONES.RESIDENTIAL, p3, 2);
    tx = await city._setPlot(1, 3, 1, ZONES.RESIDENTIAL, p3, 2);
    tx = await city._setPlot(1, 3, 2, ZONES.COMMERCIAL, p3, 3);
    tx = await city._setPlot(1, 3, 3, ZONES.INDUSTRIAL, p2, 3);
    ppLogs(tx);

    await debugBoard(1, city);
  });

  it('calculate income', async function() {
    let tx;
    tx = await city.calculateIncome(1);
    await debugPlayers(1, city);
  });
});
