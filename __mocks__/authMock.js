const authFetch = jest.fn((url, options) => {
  if (options === undefined) return globalThis.fetch(url);
  const headers = { ...(options.headers || {}) };
  if (options.body && !headers['Content-Type'] && !headers['content-type']) {
    headers['Content-Type'] = 'application/json';
  }
  return globalThis.fetch(url, { ...options, headers });
});
module.exports = { authFetch };
