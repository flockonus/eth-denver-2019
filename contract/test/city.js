const City = artifacts.require('City');

function ppLogs(tx) {
  const { logs } = tx;
  console.log('logs:', logs.map((l) => ({ label: l.event, arg: l.args })));
}

const ZONES = {
  RESIDENTIAL: 0,
  COMMERCIAL: 1,
  INDUSTRIAL: 2,
};

function cropAddress(addr) {
  return '..' + addr.substring(39);
}

// a plot obj from SC
function ppPlot(plot) {
  let zone = 'R';
  if (plot[1].eq(1)) zone = 'C';
  if (plot[1].eq(2)) zone = 'I';

  return `${cropAddress(plot[0])} | ${zone} | ${plot[2].toNumber()}`;
}

async function debugBoard(gameId, city) {
  for (let x = 0; x < 4; x++) {
    for (let y = 0; y < 4; y++) {
      const plot = await city.getPlot(gameId, x, y);
      console.log(`[${x}, ${y}]`, 'plot', ppPlot(plot));
    }
  }
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
    let price = 10;
    tx = await city._setPlot(1, 0, 0, ZONES.RESIDENTIAL, p1, price);
    tx = await city._setPlot(1, 3, 3, ZONES.RESIDENTIAL, p1, price);
    ppLogs(tx);

    await debugBoard(1, city);
  });
});
