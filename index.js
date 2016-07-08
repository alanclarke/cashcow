module.exports = function cashcow (getCache, setCache, fetch) {
  var farm = {}

  return function cowFetch (egg) {
    if (farm[egg]) return farm[egg]
    farm[egg] = getCache(egg).then(moo)
    return farm[egg].catch(opps)

    function moo (yolk) {
      if (yolk) return cleanup(yolk)
      return fetch(egg).then(hydrate)
    }

    function hydrate (yolk) {
      return setCache(egg, yolk).then(function win () {
        return cleanup(yolk)
      })
    }

    function opps (err) {
      return cleanup(err)
    }

    function cleanup (yolk) {
      delete farm[egg]
      return yolk
    }
  }
}
