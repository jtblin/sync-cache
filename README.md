# sync-cache

Cache for synchronous modules e.g. using Fibers based on [Isaac's AsyncCache](https://github.com/isaacs/async-cache).
By default use [lru-cache](https://github.com/isaacs/node-lru-cache) but can be passed any store that follows a simple api.

## Usage

    npm install sync-cache --save

```js
var SyncCache = require('sync-cache');
var client = require('./my-sync-module');
var cache = new SyncCache({ max: 1000, maxAge: 1000*60*60, load: client.find });

// ...

var value = cache.get(params);
// Do something with value
```

## Options

- `load` function to execute when no item is found in the cache
- `max` number of items to cache (passed to `lru-cache` or configured cache store), defaults **Infinity**
- `maxAge` maximum number of milliseconds to keep items, defaults **null**
- `stale` boolean to indicate if cache should return stale items (`lru-cache`),default **false**
- `store` cache store object, default **lru-cache**

## API

### get (key)

Returns an item from the cache. If the item is not found, call the load handler to retrieve the item and
save the item in the cache.

### set (key, value)

Save the value in the cache for key.

### del (key)

Delete an item from the cache.

### reset ()

Remove all items from the cache.
**Note** support varies with underlying cache stores, e.g. not possible with `sync-memcached-store`.

### has (key)

Check if a key exists without returning the value.
**Note** support varies with underlying cache stores, e.g. it is the same as a `get` with `sync-memcached-store`.

### peek (key)

Calls underlying cache store `peek` method.
**Note** support varies with underlying cache stores, e.g. not possible with `sync-memcached-store`.

## Cache stores

To create a new cache store for SyncCache, it must support the same API i.e. get, has, set, del, reset, has, peek.