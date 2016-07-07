var Promise = require('es6-promise').Promise

module.exports = function createHelpers (sandbox, cashcow) {
  var db = {}
  var cache = {}

  function fetch (key) {
    return new Promise(function resolver (resolve, reject) {
      resolve(db[key])
    })
  }

  function getCache (key) {
    return new Promise(function resolver (resolve, reject) {
      resolve(cache[key])
    })
  }

  function setCache (key, value) {
    return new Promise(function resolver (resolve, reject) {
      cache[key] = value
      resolve()
    })
  }

  return {
    db: db,
    cache: cache,
    fetch: sandbox.spy(fetch),
    getCache: sandbox.spy(getCache),
    setCache: sandbox.spy(setCache)
  }
}
