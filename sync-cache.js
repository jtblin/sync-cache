module.exports = SyncCache;

var LRU = require('lru-cache'), qs = require('querystring');

function SyncCache(opts) {
  if (! opts || typeof opts !== 'object')
    throw new Error('options must be an object');

  if (! opts.load)
    throw new Error('load function is required');

  if (! (this instanceof SyncCache))
    return new SyncCache(opts);

  this._opts = opts;
  this._cache = opts.store ? opts.store : new LRU(opts);
  this._load = opts.load;
  this._allowStale = opts.stale;
}

Object.defineProperty(SyncCache.prototype, 'itemCount', {
  get: function () {
    return this._cache.itemCount;
  },
  enumerable: true,
  configurable: true
});

SyncCache.prototype.get = function (origKey) {
  var key = convertKey(origKey);
  var has = this._cache.has(key);
  var cached = this._cache.get(key);
  if (has && void 0 !== cached)
    return cached;

  if (void 0 !== cached && this._allowStale && !has)
    return cached;

  var res = this._load(origKey);
  this._cache.set(key, res);
  return res;
};

SyncCache.prototype.set = function(key, val) {
  key = convertKey(key);
  return this._cache.set(key, val);
};

SyncCache.prototype.reset = function() {
  return this._cache.reset();
};

SyncCache.prototype.has = function(key) {
  key = convertKey(key);
  return this._cache.has(key);
};

SyncCache.prototype.del = function(key) {
  key = convertKey(key);
  return this._cache.del(key);
};

SyncCache.prototype.peek = function(key) {
  key = convertKey(key);
  return this._cache.peek(key);
};

function convertKey (key) {
  return typeof key === 'object' ? qs.stringify(key) : key;
}

