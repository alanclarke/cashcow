# ![cashcow](https://cloud.githubusercontent.com/assets/640611/16666936/be6cfe96-4481-11e6-9962-44e7bbe6a537.png)


A smart cached value fetcher that...

- pools consumers while fetching to avoid doing multiple trips
- guarantees only one instance of resource is ever held in memory
- satisfies consumers early if already fetching

cashcow is not prescriptive about what cache your using, simply provide it with two functions:

- get(key) a function that gets value from cache and returns a promise for that value
- populate(key) a function that populates the cache, returning a promise that resolves when complete

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
