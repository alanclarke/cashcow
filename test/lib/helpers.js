var Promise = require('es6-promise').Promise

module.exports = function createHelpers (sandbox, cashcow) {
  var db = {}
  var cache = {}

  function fetch (key) {
    return Promise.resolve(cache[key])
  }

  function hydrate (key, value) {
    return new Promise(function resolver (resolve, reject) {
      cache[key] = db[key]
      resolve()
    })
  }

  return {
    db: db,
    cache: cache,
    fetch: sandbox.spy(fetch),
    hydrate: sandbox.spy(hydrate)
  }
}
