module.exports = function cashcow (fetch, hydrate) {
  var farm = {}

  return function cowFetch (egg) {
    if (farm[egg]) return farm[egg]
    farm[egg] = fetch(egg).then(moo)
    return farm[egg].catch(cowpat)

    function moo (yolk) {
      if (typeof yolk !== 'undefined') return mop(yolk)
      return hydrate(egg).then(huzzah)
    }

    function huzzah () {
      return fetch(egg).then(mop)
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
