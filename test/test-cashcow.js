var Promise = require('es6-promise').Promise
var cashcow = require('../index')
var helperAPI = require('./lib/helpers')
var sinon = require('sinon')
var expect = require('sinon-expect').enhance(require('expect.js'), sinon, 'was')

describe('cowFetch', function () {
  var sandbox, helpers, db, cache, hydrate, fetch, cowFetch

  beforeEach(function () {
    sandbox = sinon.sandbox.create()
    helpers = helperAPI(sandbox, cashcow)
    db = helpers.db
    cache = helpers.cache
    hydrate = helpers.hydrate
    fetch = helpers.fetch
    cowFetch = cashcow(fetch, hydrate)
  })

  afterEach(function () {
    sandbox.restore()
  })

  describe('if the cache exists', function () {
    beforeEach(function () {
      cache.a = 1
    })

    it('should try to fetch from cache', function () {
      return cowFetch('a').then(() => {
        expect(fetch).was.calledOnce()
      })
    })

    it('should not hydrate', function () {
      return cowFetch('a').then(() => {
        expect(hydrate).was.notCalled()
      })
    })

    it('should return the result', function () {
      return cowFetch('a').then((result) => {
        expect(result).to.eql(1)
      })
    })

    it('should share the results with any consumers that request the resource in the meantime', function () {
      return Promise.all([
        cowFetch('a'),
        cowFetch('a'),
        cowFetch('a')
      ]).then(function () {
        expect(fetch).was.calledOnce()
      })
    })

    it('should propagate rejected promise to all consumers if fetch fails', function () {
      cowFetch = cashcow(reject, hydrate)
      return Promise.all([
        catcher(cowFetch('a')),
        catcher(cowFetch('a')),
        catcher(cowFetch('a'))
      ])
      .then(function (results) {
        results.forEach(function (result) {
          expect(result).to.be.a(Error)
          expect(result.message).to.eql('derp')
        })
      })
    })

    it('should recover if getCache starts working again', function () {
      var eventuallyWorks = sinon.stub()
      eventuallyWorks
        .onFirstCall().returns(Promise.reject(new Error('derp')))
        .onSecondCall().returns(Promise.resolve(cache.a))
      cowFetch = cashcow(eventuallyWorks, hydrate)
      var firstFetch = catcher(cowFetch('a'))
      return Promise.all([
        firstFetch,
        firstFetch.then(function () { return cowFetch('a') })
      ])
      .then(function (results) {
        expect(results[0]).to.be.a(Error)
        expect(results[0].message).to.eql('derp')
        expect(results[1]).to.eql(1)
      })
    })
  })

  describe('if the cache does not exist', function () {
    beforeEach(function () {
      db.a = 1
    })

    it('should try to fetch from cache', function () {
      return cowFetch('a').then(() => {
        expect(fetch).was.called()
      })
    })

    it('should hydrate', function () {
      return cowFetch('a').then(() => {
        expect(hydrate).was.calledOnce()
        expect(cache.a).to.eql(1)
      })
    })

    it('should try to fetch from cache again', function () {
      return cowFetch('a').then(() => {
        expect(fetch).was.calledTwice()
      })
    })

    it('should return the result', function () {
      return cowFetch('a').then((result) => {
        expect(result).to.eql(1)
      })
    })

    it('should share the results with any consumers that request the resource in the meantime', function () {
      return Promise.all([
        cowFetch('a'),
        cowFetch('a'),
        cowFetch('a')
      ]).then(function () {
        expect(fetch).was.calledTwice()
        expect(hydrate).was.calledOnce()
      })
    })

    it('should propagate rejected promise to all consumers if hydrate fails', function () {
      cowFetch = cashcow(fetch, reject)
      return Promise.all([
        catcher(cowFetch('a')),
        catcher(cowFetch('a')),
        catcher(cowFetch('a'))
      ])
      .then(function (results) {
        results.forEach(function (result) {
          expect(result).to.be.a(Error)
          expect(result.message).to.eql('derp')
        })
      })
    })

    it('should recover if hydrate starts working again', function () {
      var callCount = 0
      var eventuallyWorks = sinon.spy(function () {
        if (!callCount++) return Promise.reject(new Error('derp'))
        cache.a = db.a
        return Promise.resolve()
      })
      cowFetch = cashcow(fetch, eventuallyWorks)
      var firstFetch = catcher(cowFetch('a'))
      return Promise.all([
        firstFetch,
        firstFetch.then(function () {
          return cowFetch('a')
        })
      ])
      .then(function (results) {
        expect(results[0]).to.be.a(Error)
        expect(results[0].message).to.eql('derp')
        expect(results[1]).to.eql(1)
      })
    })

    it('should propagate rejected promise to all consumers if fetch fails', function () {
      cowFetch = cashcow(reject, hydrate)
      return Promise.all([
        catcher(cowFetch('a')),
        catcher(cowFetch('a')),
        catcher(cowFetch('a'))
      ])
      .then(function (results) {
        results.forEach(function (result) {
          expect(result).to.be.a(Error)
          expect(result.message).to.eql('derp')
        })
      })
    })

    it('should recover if fetch starts working again', function () {
      var eventuallyWorks = sinon.stub()
      eventuallyWorks
        .onFirstCall().returns(Promise.reject(new Error('derp')))
        .onSecondCall().returns(Promise.resolve(db.a))
      cowFetch = cashcow(eventuallyWorks, hydrate)
      var firstFetch = cowFetch('a').then(function (err) {
        return err
      }, function (err) {
        return err
      })
      return Promise.all([
        firstFetch,
        firstFetch.then(function () {
          return cowFetch('a')
        })
      ])
      .then(function (results) {
        expect(results[0]).to.be.a(Error)
        expect(results[0].message).to.eql('derp')
        expect(results[1]).to.eql(1)
      })
    })
  })
})

function catcher (promise) {
  return promise.then(function wut () {
    throw new Error('expected promise to be rejected')
  }, function ahh (err) {
    return err
  })
}

function reject () {
  return Promise.reject(new Error('derp'))
}
