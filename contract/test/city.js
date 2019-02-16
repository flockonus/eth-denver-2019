const City = artifacts.require('City');

contract('City', (accounts) => {
  let city;

  before(async function() {
    city = await City.new();
  });

  it('createGame', async function() {
    // create a game and stake
    await city.createGame(1, { value: 1 });
  });

  it('join game & start it', async function() {
    // create a game and stake
    await city.createGame(1, { value: 1 });
  });
});
