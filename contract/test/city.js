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
  console.log(`Players and balances:`);
  const playerinfo = await city.getPlayers(gameId);
  for (let i = 0; i < playerinfo[0].length; ++i) {
    console.log(`player ${playerinfo[0][i]}; balance ${playerinfo[1][i]}`);
  }
}

async function setupGame(city, accounts) {
  let tx = await city.createGame(0, { value: 0, from: accounts[0] });
  const id = tx.logs
    .filter((e) => e.event === 'GameCreated')[0]
    .args.gameId.toNumber();
  await city.joinGame(id, { value: 0, from: accounts[1] });
  return id;
}

contract('City', (accounts) => {
  let city;
  const p1 = accounts[0];
  const p2 = accounts[1];

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
    tx = await city._setPlot(1, 0, 0, ZONES.RESIDENTIAL, p1, 4);
    tx = await city._setPlot(1, 1, 0, ZONES.COMMERCIAL, p1, 6);
    tx = await city._setPlot(1, 2, 0, ZONES.INDUSTRIAL, p1, 4);
    tx = await city._setPlot(1, 3, 0, ZONES.RESIDENTIAL, p1, 7);
    tx = await city._setPlot(1, 4, 0, ZONES.INDUSTRIAL, p1, 1);

    tx = await city._setPlot(1, 0, 1, ZONES.COMMERCIAL, p2, 1);
    tx = await city._setPlot(1, 1, 1, ZONES.RESIDENTIAL, p2, 1);
    tx = await city._setPlot(1, 2, 1, ZONES.COMMERCIAL, p2, 1);
    tx = await city._setPlot(1, 3, 1, ZONES.INDUSTRIAL, p2, 1);
    tx = await city._setPlot(1, 4, 1, ZONES.COMMERCIAL, p2, 1);

    tx = await city._setPlot(1, 0, 2, ZONES.RESIDENTIAL, p1, 5);
    tx = await city._setPlot(1, 1, 2, ZONES.COMMERCIAL, p1, 4);
    tx = await city._setPlot(1, 2, 2, ZONES.INDUSTRIAL, p1, 3);
    tx = await city._setPlot(1, 3, 2, ZONES.RESIDENTIAL, p1, 2);

    tx = await city._setPlot(1, 0, 3, ZONES.COMMERCIAL, p2, 1);
    tx = await city._setPlot(1, 2, 3, ZONES.RESIDENTIAL, p2, 2);
    tx = await city._setPlot(1, 3, 3, ZONES.INDUSTRIAL, p2, 3);
    tx = await city._setPlot(1, 4, 3, ZONES.RESIDENTIAL, p2, 4);

    tx = await city._setPlot(1, 0, 4, ZONES.RESIDENTIAL, p1, 10);
    tx = await city._setPlot(1, 1, 4, ZONES.INDUSTRIAL, p1, 10);
    tx = await city._setPlot(1, 3, 4, ZONES.RESIDENTIAL, p1, 10);

    ppLogs(tx);

    await debugBoard(1, city);
  });

  it('resolve bids', async function() {
    // setup a new game for this test
    const gameId = await setupGame(city, accounts);
    let tx;

    // p1 bids on a terrain
    let price = 10;
    tx = await city.bid(gameId, 0, 0, ZONES.RESIDENTIAL, price);
    // console.log(tx.logs);
    tx = await city.bid(gameId, 0, 0, ZONES.RESIDENTIAL, price - 1);
    // console.log(tx.logs);
    tx = await city.bid(gameId, 0, 0, ZONES.RESIDENTIAL, price - 1);

    tx = await city._resolveBids(gameId);
    console.log(
      tx.logs.map((ev) => ({ ev: ev.args[0], plotId: ev.args[1].toNumber() })),
    );
  });

  it.skip('calculate income', async function() {
    let tx;
    tx = await city.calculateIncome(1);
    await debugPlayers(1, city);
  });
});
