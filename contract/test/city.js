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

function destructPlotId(plotId) {
  return [];
}

function cropAddress(addr) {
  return '..' + addr.substring(39);
}

Number.prototype.pad = function(size) {
  var s = String(this);
  while (s.length < (size || 2)) {s = " " + s;}
  return s;
}

function getZone(zoneId) {
  var zone = 'U';
  if (zoneId == 1) zone = 'R';
  if (zoneId == 2) zone = 'C';
  if (zoneId == 3) zone = 'I';
  return zone;
}
// a plot obj from SC
function ppPlot(plot) {
  var zone = getZone(plot[1]);
  return `${cropAddress(plot[0])} | ${zone} | ${plot[2].toNumber()}`;
}

async function debugBoard(gameId, city, plot2D = false) {
  for (let x = 0; x < 5; x++) {
    var row = "";
    for (let y = 0; y < 5; y++) {
      const plot = await city.getPlot(gameId, x, y);
      if (!plot2D) console.log(`[${x}, ${y}]`, 'plot', ppPlot(plot));
      row += "[" + cropAddress(plot[0]) + ": " + plot[2].toNumber().pad(2) + " " + getZone(plot[1]) + "] ";
    }
    if (plot2D) console.log(row);
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

async function fillBoard(city, accounts) {
  const p1 = accounts[0];
  const p2 = accounts[1];
  let tx;

  tx = await city._setPlot(1, 0, 0, ZONES.RESIDENTIAL, p1, 4);
  tx = await city._setPlot(1, 1, 0, ZONES.COMMERCIAL, p1, 6);
  tx = await city._setPlot(1, 2, 0, ZONES.INDUSTRIAL, p1, 4);
  tx = await city._setPlot(1, 3, 0, ZONES.RESIDENTIAL, p1, 7);
  tx = await city._setPlot(1, 4, 0, ZONES.INDUSTRIAL, p1, 1);

  tx = await city._setPlot(1, 0, 1, ZONES.COMMERCIAL, p2, 5);
  tx = await city._setPlot(1, 1, 1, ZONES.RESIDENTIAL, p2, 5);
  tx = await city._setPlot(1, 2, 1, ZONES.COMMERCIAL, p2, 5);
  tx = await city._setPlot(1, 3, 1, ZONES.INDUSTRIAL, p2, 5);
  tx = await city._setPlot(1, 4, 1, ZONES.COMMERCIAL, p2, 5);

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

  await debugBoard(1, city, true);
}

contract('City', (accounts) => {
  const gameId = 1;
  let city;
  const p1 = accounts[0];
  const p2 = accounts[1];

  before(async function() {
    city = await City.new();
  });

  it('createGame', async function() {
    // create a game and stake
    const tx = await city.createGame(gameId, { value: 1, from: p1 });
    // ppLogs(tx); // looking good! Join + GameCreated
  });

  it('join game & start it', async function() {
    const tx = await city.joinGame(gameId, { value: 1, from: p2 });
    // ppLogs(tx); // looking good! Join + GameStart
  });

  it('set some plots', async function(){ await fillBoard(city, accounts); });

  console.log("Calculate income on entire board");
  it('calculate income', async function() {
    // The above board configuration should yield +18 income for p1, +36 income for p2
    let tx;
    tx = await city.calculateIncome(gameId);
    await debugPlayers(gameId, city);
    console.log(tx.logs.map((ev) => (ev.args[0] + ev.args[1].toNumber())),);
  });

  console.log("Calculate and subtract taxes on entire board");
  it('subtract taxes', async function() {
    // The above board configuration should yield +18 income for p1, +36 income for p2
    let tx;
    tx = await city.subtractTaxes(gameId);
    await debugPlayers(gameId, city);
    console.log(tx.logs.map((ev) => (ev.args[0] + ev.args[1].toNumber())),);
  });

  console.log("Calculate income on specific plots");
  it('calculate individual plot income', async function() {
    let tx;
    tx = await city.getPlotIncome(gameId, 0, 0);
    console.log(tx);
    tx = await city.getPlotIncome(gameId, 1, 1);
    console.log(tx);
    tx = await city.getPlotIncome(gameId, 2, 2);
    console.log(tx);
    tx = await city.getPlotIncome(gameId, 3, 3);
    console.log(tx);
    tx = await city.getPlotIncome(gameId, 4, 4);
    console.log(tx);
  });

  console.log("Get full info for specific plots");
  it('Get full info for specific plots', async function() {
    let tx;
    tx = await city.getFullPlotInfo(gameId, 0, 0);
    console.log(tx);
    tx = await city.getFullPlotInfo(gameId, 1, 1);
    console.log(tx);
    tx = await city.getFullPlotInfo(gameId, 2, 2);
    console.log(tx);
    tx = await city.getFullPlotInfo(gameId, 3, 3);
    console.log(tx);
    tx = await city.getFullPlotInfo(gameId, 4, 4);
    console.log(tx);
  });

  it('resolve bids', async function() {
    // setup a new game for this test
    const gameId = 1; // await setupGame(city, accounts);
    await fillBoard(city, accounts);
    let tx;

    let price = 10;

    console.log("Placing bids for p1");
    console.log("This bid should win and not be rezoned");
    tx = await city.bid(gameId, 0, 0, ZONES.RESIDENTIAL, price, {from: accounts[0]});
    console.log(tx.logs.map((ev) => (ev.args[0] + ev.args[1].toNumber())),);

    console.log("should fail: underbid own bid");
    tx = await city.bid(gameId, 0, 0, ZONES.RESIDENTIAL, price - 1, {from: accounts[0]});
    console.log(tx.logs.map((ev) => (ev.args[0] + ev.args[1].toNumber())),);

    console.log("should succeed and be rezoned if resolved");
    tx = await city.bid(gameId, 3, 0, ZONES.COMMERCIAL, price, {from: accounts[0]});
    console.log(tx.logs.map((ev) => (ev.args[0] + ev.args[1].toNumber())),);

    console.log("Should succeed as a leading bid but not resolve because it's too low");
    tx = await city.bid(gameId, 3, 1, ZONES.INDUSTRIAL, 2, {from: accounts[0]});
    console.log(tx.logs.map((ev) => (ev.args[0] + ev.args[1].toNumber())),);

    console.log("Coin toss case for p1");
    tx = await city.bid(gameId, 4, 2, ZONES.INDUSTRIAL, 5, {from: accounts[0]});
    console.log(tx.logs.map((ev) => (ev.args[0] + ev.args[1].toNumber())),);

    console.log("Placing bids for p2")
    console.log("should fail: equal bid, not owner");
    tx = await city.bid(gameId, 0, 0, ZONES.INDUSTRIAL, price, {from: accounts[1]});
    console.log(tx.logs.map((ev) => (ev.args[0] + ev.args[1].toNumber())),);

    console.log("should be placed but fail to resolve because existing owner p1 already set value at the same amount");
    tx = await city.bid(gameId, 2, 0, ZONES.RESIDENTIAL, 4, {from: accounts[1]});
    console.log(tx.logs.map((ev) => (ev.args[0] + ev.args[1].toNumber())),);

    console.log("Should succeed: overbid p1, and should be rezoned");
    tx = await city.bid(gameId, 3, 0, ZONES.INDUSTRIAL, price + 1, {from: accounts[1]});
    console.log(tx.logs.map((ev) => (ev.args[0] + ev.args[1].toNumber())),);

    console.log("Should succeed; Devalue p2's own property. Not rezoned.");
    tx = await city.bid(gameId, 4, 3, ZONES.RESIDENTIAL, 2, {from: accounts[1]});
    console.log(tx.logs.map((ev) => (ev.args[0] + ev.args[1].toNumber())),);

    console.log("Coin toss case for p2");
    tx = await city.bid(gameId, 4, 2, ZONES.COMMERCIAL, 5, {from: accounts[1]});
    console.log(tx.logs.map((ev) => (ev.args[0] + ev.args[1].toNumber())),);

    console.log("Resolve bids and update grid, player balances");
    tx = await city._resolveBids(gameId);
    console.log(tx.logs.map((ev) => (ev.args[0] + ev.args[1].toNumber())),);

    console.log("Make sure bids are all wiped out - this should do nothing");
    tx = await city._resolveBids(gameId);
    console.log(tx.logs.map((ev) => (ev.args[0] + ev.args[1].toNumber())),);
  });

});
