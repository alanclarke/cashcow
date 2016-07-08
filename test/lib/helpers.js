var Promise = require('es6-promise').Promise

module.exports = function createHelpers (sandbox, cashcow) {
  var db = {}
  var cache = {}

  function get (key) {
    return Promise.resolve(cache[key])
  }

  function populate (key, value) {
    return new Promise(function resolver (resolve, reject) {
      cache[key] = db[key]
      resolve()
    })
  }

  return {
    db: db,
    cache: cache,
    get: sandbox.spy(get),
    populate: sandbox.spy(populate)
  }
}
