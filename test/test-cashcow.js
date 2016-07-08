var Promise = require('es6-promise').Promise
var cashcow = require('../index')
var helperAPI = require('./lib/helpers')
var sinon = require('sinon')
var expect = require('sinon-expect').enhance(require('expect.js'), sinon, 'was')

describe('cowFetch', function () {
  var sandbox, helpers, db, cache, get, populate, cowFetch

  beforeEach(function () {
    sandbox = sinon.sandbox.create()
    helpers = helperAPI(sandbox, cashcow)
    db = helpers.db
    cache = helpers.cache
    populate = helpers.populate
    get = helpers.get
    cowFetch = cashcow(get, populate)
  })

  afterEach(function () {
    sandbox.restore()
  })

  describe('if the cache exists', function () {
    beforeEach(function () {
      cache.a = 1
    })

    it('should try to get from cache', function () {
      return cowFetch('a').then(() => {
        expect(get).was.calledOnce()
      })
    })

    it('should not populate', function () {
      return cowFetch('a').then(() => {
        expect(populate).was.notCalled()
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
        expect(get).was.calledOnce()
      })
    })

    it('should propagate rejected promise to all consumers if get fails', function () {
      cowFetch = cashcow(reject, populate)
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

    it('should recover if get starts working again', function () {
      var eventuallyWorks = sinon.stub()
      eventuallyWorks
        .onFirstCall().returns(Promise.reject(new Error('derp')))
        .onSecondCall().returns(Promise.resolve(cache.a))
      cowFetch = cashcow(eventuallyWorks, populate)
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

    it('should try to get from cache', function () {
      return cowFetch('a').then(() => {
        expect(get).was.called()
      })
    })

    it('should populate', function () {
      return cowFetch('a').then(() => {
        expect(populate).was.calledOnce()
        expect(cache.a).to.eql(1)
      })
    })

    it('should try to get from cache again', function () {
      return cowFetch('a').then(() => {
        expect(get).was.calledTwice()
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
        expect(get).was.calledTwice()
        expect(populate).was.calledOnce()
      })
    })

    it('should propagate rejected promise to all consumers if populate fails', function () {
      cowFetch = cashcow(get, reject)
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

    it('should recover if populate starts working again', function () {
      var callCount = 0
      var eventuallyWorks = sinon.spy(function () {
        if (!callCount++) return Promise.reject(new Error('derp'))
        cache.a = db.a
        return Promise.resolve()
      })
      cowFetch = cashcow(get, eventuallyWorks)
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

    it('should propagate rejected promise to all consumers if get fails', function () {
      cowFetch = cashcow(reject, populate)
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

    it('should recover if get starts working again', function () {
      var eventuallyWorks = sinon.stub()
      eventuallyWorks
        .onFirstCall().returns(Promise.reject(new Error('derp')))
        .onSecondCall().returns(Promise.resolve(db.a))
      cowFetch = cashcow(eventuallyWorks, populate)
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
