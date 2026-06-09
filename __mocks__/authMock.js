const authFetch = jest.fn((url, options) =>
  options !== undefined ? globalThis.fetch(url, options) : globalThis.fetch(url)
);
module.exports = { authFetch };
