
// Creates an object that represents the grid, where each tile is a key
export function createGridModel(dim) {
  const grid = {};
  for (let y = 0; y < dim; y++) {
    for (let x = 0; x < dim; x++) {
      const id = `${x}-${y}`;
      grid[id] = {
        id,
        x,
        y,
        price: 0,
        owner: null,
        zone: 0,
        // income: 0,
        // tax: 0,
        // can add more properties here
      }
    }
  }
  // Some mock stuff data so we can view the state
  grid[`0-0`].zone = 1;
  grid[`1-0`].zone = 2;
  grid[`2-0`].zone = 3;
  return grid;
}