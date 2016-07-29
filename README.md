# ![cashcow](https://cloud.githubusercontent.com/assets/640611/16708914/d14dee66-45f9-11e6-9334-a153eeb9144f.png)

A smart cached value fetcher that...

- pools consumers while fetching to avoid doing multiple trips
- guarantees only one instance of resource is ever held in memory
- satisfies consumers early if already fetching

cashcow is not prescriptive about what cache your using, simply provide it with two functions:

- get(key) a function that gets value from cache and returns a promise for that value
- populate(key) optionally provide function that populates the cache and returns a promise for the value when complete

## installation
```
npm install cashcow
```

## usage
```js

// scenario 1: lazy population of individual cache keys

var cashcow = require('cashcow')
var cowFetch = cashcow(get, populate)

function get (key) {
  return myCache.get(key)
}

function populate (key) {
  return fetchFromSource(key).then(function (val) {
    return myCache.set(key, val)
  })
}

// usage
cowFetch(key) // populates cache then returns val from cache
cowFetch(key) // combined with previous fetch
cowFetch(key).then(function (val) {
  // cache has been populated
  cowFetch(key) // gets from cache
  cowFetch(key) // combined with previous fetch
  cowFetch(key).then(function (val) {
    cowFetch(key) // requests again from cache
  })
})


// scenario 2: lazy population of entire cache

var cashcow = require('cashcow')
var cowFetch = cashcow(populate)

function get (key) {
  return myCache.get(key).then(function (val) {
    if (!val) return cowFetch().then(() => get(key))
  })
}

function populate () {
  return fetchAllFromSource().then(myCache.hydrateAll)
}

// usage
get(key) // fetches from cache, calls populates to populate entire cache
get(key) // call to populate combined with previous one
get(key).then(function (val) {
  // cache has been populated
  get(key) // val fetched straight from cache
})
```

## run tests
```
npm test
```

## Want to work on this for your day job?

This project was created by the Engineering team at Qubit. As we use open source libraries, we make our projects public where possible.

We’re currently looking to grow our team, so if you’re a JavaScript engineer and keen on ES2016 React+Redux applications and Node micro services, why not get in touch? Work with like minded engineers in an environment that has fantastic perks, including an annual ski trip, yoga, a competitive foosball league, and copious amounts of yogurt.

Find more details on our Engineering site. Don’t have an up to date CV? Just link us your Github profile! Better yet, send us a pull request that improves this project.`
Contact GitHub API Training Shop Blog About
