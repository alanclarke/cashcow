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
  })
})
