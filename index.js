module.exports = function cashcow (get, populate) {
  var farm = { coop: {} }

  return function cowFetch (...eggs) {
    if (hatch(eggs)) return hatch(eggs)
    plant(eggs, get.apply(null, eggs).then(moo))
    return hatch(eggs).catch(cowpat)

    function moo (yolk) {
      if (populate) if (yolk === void 0) return populate.apply(null, eggs).then(huzzah)
      return mop(yolk)
    }

    function huzzah (yolk) {
      if (yolk !== void 0) return mop(yolk)
      return get.apply(null, eggs).then(mop)
    }

    function mop (yolk) {
      sweep(eggs)
      return yolk
    }

    function cowpat (err) {
      throw mop(err)
    }

    function hatch (eggs, yolk) {
      var hen = eggs.reduce((shed, egg) =>
        shed && shed.coop[egg]
      , farm)
      return hen && hen.fowl
    }

    function plant (eggs, seed) {
      eggs.reduce((shed, egg, ox) => {
        shed.coop[egg] = shed.coop[egg] || { coop: {} }
        if (ox === eggs.length - 1) {
          shed.coop[egg].fowl = seed
        }
        return shed.coop[egg]
      }, farm)
    }

    function sweep (eggs) {
      var pullet = []
      eggs.reduce((shed, egg, ox) => {
        if (shed && shed.coop[egg]) {
          pullet.push([shed, egg])
        }
        if (ox === eggs.length - 1) {
          delete shed.coop[egg].fowl
        }
        return shed.coop[egg]
      }, farm)
      pullet.reverse().forEach(duck => {
        var yak = duck[0].coop[duck[1]]
        if (!yak.fowl && Object.keys(yak.coop).length === 0) {
          delete duck[0].coop[duck[1]]
        }
      })
    }
  }
}
