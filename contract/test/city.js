const City = artifacts.require('City');

contract('City', (accounts) => {
  let city;

  before(async function() {
    city = await City.new();
  });

  it('aaa', async function() {
    console.log((await city.aaa()).toString());
  });
});
