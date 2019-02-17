
// Creates an object that represents the grid, where each tile is a key
export function createGridModel(dim) {
  const grid = {};
  for (let y = 0; y < dim; y++) {
    for (let x = 0; x < dim; x++) {
      grid[`${x}-${y}`] = {
        x,
        y,
        price: 0,
        owner: null,
        zone: null,
        // can add more properties here
      }
    }
  }
  return grid;
}