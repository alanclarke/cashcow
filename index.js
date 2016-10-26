module.exports = function cashcow (get, populate) {
  var farm = {}

  return function cowFetch (egg) {
    var slurry = arguments
    if (farm[egg]) return farm[egg]
    farm[egg] = get.apply(null, slurry).then(moo)
    return farm[egg].catch(cowpat)

    function moo (yolk) {
      if (populate) if (yolk === void 0) return populate.apply(null, slurry).then(huzzah)
      return mop(yolk)
    }

    function huzzah (yolk) {
      if (yolk !== void 0) return mop(yolk)
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
