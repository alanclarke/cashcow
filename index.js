module.exports = function cashcow (get, populate) {
  var farm = {}

  return function cowFetch (egg) {
    if (farm[egg]) return farm[egg]
    farm[egg] = get(egg).then(moo)
    return farm[egg].catch(cowpat)

    function moo (yolk) {
      if (populate) if (yolk === void 0) return populate(egg).then(huzzah)
      return mop(yolk)
    }

    function huzzah () {
      return get(egg).then(mop)
    }

    function mop (yolk) {
      delete farm[egg]
      return yolk
    }

    function cowpat (err) {
      throw mop(err)
    }
  }
}
