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
var cashcow = require('cashcow')
var cowFetch = cashcow(get, populate)

cowFetch('mything') // populates cache then returns value from cache
cowFetch('mything') // combined with previous fetch
cowFetch('mything').then(function (thing) {
  // cache has been populated
  cowFetch('mything') // gets from cache
  cowFetch('mything') // combined with previous fetch
  cowFetch('mything').then(function (thing) {
    cowFetch('mything') // requests again from cache
  })
})

function get (key) {
  return myCustomCache.get(key)
}

function populate (key) {
  return fetchFromSource(key).then(function (val) {
    return myCustomCache.set(key, val)
  })
}
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
