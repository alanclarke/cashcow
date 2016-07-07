module.exports = function cashcow (getCache, setCache, fetch) {
  var farm = {}

  return function cowFetch (egg) {
    if (farm[egg]) return farm[egg]
    farm[egg] = getCache(egg).then(moo)
    return farm[egg]

    function moo (result) {
      if (result) {
        delete farm[egg]
        return result
      }
      return fetch(egg).then(hydrate)
    }

    function hydrate (result) {
      return setCache(egg, result).then(function cleanup () {
        delete farm[egg]
        return result
      })
    }
  }
}
