var Promise = require('es6-promise').Promise
var cashcow = require('../index')
var helperAPI = require('./lib/helpers')
var sinon = require('sinon')
var expect = require('sinon-expect').enhance(require('expect.js'), sinon, 'was')

describe('cowFetch', function () {
  var sandbox, helpers, db, cache, getCache, setCache, fetch, cowFetch

  beforeEach(function () {
    sandbox = sinon.sandbox.create()
    helpers = helperAPI(sandbox, cashcow)
    db = helpers.db
    cache = helpers.cache
    getCache = helpers.getCache
    setCache = helpers.setCache
    fetch = helpers.fetch
    cowFetch = cashcow(getCache, setCache, fetch)
  })

  afterEach(function () {
    sandbox.restore()
  })

  describe('if the cache exists', function () {
    beforeEach(function () {
      cache.a = 1
    })

    it('should not fetch for realz', function () {
      return cowFetch('a').then(() => {
        expect(fetch).was.notCalled()
      })
    })

    it('should get from cache', function () {
      return cowFetch('a').then(() => {
        expect(getCache).was.calledOnce()
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
        expect(getCache).was.calledOnce()
      })
    })

    it('should propagate rejected promise to all consumers if cache fails', function () {
      cowFetch = cashcow(reject, setCache, fetch)
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
      cowFetch = cashcow(eventuallyWorks, setCache, fetch)
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

    it('should fetch for realz', function () {
      return cowFetch('a').then(() => {
        expect(fetch).was.calledOnce()
      })
    })

    it('should have hydrated the cache', function () {
      return cowFetch('a').then(() => {
        expect(setCache).was.calledOnce()
        expect(cache.a).to.eql(1)
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
        expect(getCache).was.calledOnce()
      })
    })

    it('should propagate rejected promise to all consumers if hydrate fails', function () {
      cowFetch = cashcow(getCache, reject, fetch)
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

    it('should recover if setCache starts working again', function () {
      var eventuallyWorks = sinon.stub()
      eventuallyWorks
        .onFirstCall().returns(Promise.reject(new Error('derp')))
        .onSecondCall().returns(Promise.resolve())
      cowFetch = cashcow(getCache, eventuallyWorks, fetch)
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

    it('should propagate rejected promise to all consumers if fetch fails', function () {
      cowFetch = cashcow(getCache, setCache, reject)
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
      cowFetch = cashcow(getCache, setCache, eventuallyWorks)
      var firstFetch = cowFetch('a').then(function (err) {
        return err
      }, function (err) {
        return err
      })
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
