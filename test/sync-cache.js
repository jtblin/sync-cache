describe('SyncCache', function () {

  var SyncCache = require('../sync-cache'), sandbox;

  function Store () {
  }
  Store.prototype.get = Store.prototype.set = Store.prototype.del = Store.prototype.has = Store.prototype.peek = Store.prototype.reset = noop;
  function noop () {}

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('#set', function () {
    it('writes data to the cache store', function () {
      var mock = sandbox.mock(Store.prototype);
      mock.expects('set').once().withExactArgs('key', 'value').returns(true);
      var cache = new SyncCache({store: new Store, load: noop});
      cache.set('key', 'value').should.be.true;
      mock.verify();
    });
  });

  describe('#has', function () {
    it('checks if the key exists in the cache store', function () {
      var mock = sandbox.mock(Store.prototype);
      mock.expects('has').once().withExactArgs('key').returns(true);
      var cache = new SyncCache({store: new Store, load: noop});
      cache.has('key').should.be.true;
      mock.verify();
    });
  });

  describe('#get', function () {
    it('gets data from the cache store', function () {
      var mock = sandbox.mock(Store.prototype);
      mock.expects('has').once().withExactArgs('key').returns(true);
      mock.expects('get').once().withExactArgs('key').returns(true);
      var cache = new SyncCache({store: new Store, load: noop});
      cache.get('key').should.be.true;
      mock.verify();
    });

    it('gets data from the handler if no data in cache store', function () {
      var mock = sandbox.mock(Store.prototype);
      mock.expects('has').once().withExactArgs('key').returns(false);
      mock.expects('get').once().withExactArgs('key').returns(void 0);
      var load = sandbox.spy();
      var cache = new SyncCache({store: new Store, load: load});
      cache.get('key');
      load.should.have.been.calledOnce;
      load.should.have.been.calledWith('key');
      mock.verify();
    });

    it('returns the data from the cache if stale data and allow stale is true', function () {
      var mock = sandbox.mock(Store.prototype);
      mock.expects('has').once().withExactArgs('key').returns(false);
      mock.expects('get').once().withExactArgs('key').returns(true);
      var load = sandbox.spy();
      var cache = new SyncCache({store: new Store, load: load, stale: true});
      cache.get('key').should.be.true;
      load.should.not.have.been.called;
      mock.verify();
    });

    it('gets data from the handler if stale data and allow stale is not true', function () {
      var mock = sandbox.mock(Store.prototype);
      mock.expects('has').once().withExactArgs('key').returns(false);
      mock.expects('get').once().withExactArgs('key').returns(true);
      var load = sandbox.spy();
      var cache = new SyncCache({store: new Store, load: load});
      cache.get('key');
      load.should.have.been.calledOnce;
      load.should.have.been.calledWith('key');
      mock.verify();
    });
  });

  describe('#del', function () {
    it('deletes the item from the cache store', function () {
      var mock = sandbox.mock(Store.prototype);
      mock.expects('del').once().withExactArgs('key').returns(true);
      var cache = new SyncCache({store: new Store, load: noop});
      cache.del('key').should.be.true;
      mock.verify();
    });
  });

  describe('#peek', function () {
    it('peeks the item from the cache store', function () {
      var mock = sandbox.mock(Store.prototype);
      mock.expects('peek').once().withExactArgs('key').returns(true);
      var cache = new SyncCache({store: new Store, load: noop});
      cache.peek('key').should.be.true;
      mock.verify();
    });
  });

  describe('#convertKey', function () {
    // TODO: add tests
  });

  describe('integration tests', function () {
    var Sync = require('syncho'), fs = require('fs'), cache;

    beforeEach(function () {
      cache = new SyncCache({load: stat});
    });

    function stat (filepath) {
      return fs.stat.sync(null, filepath);
    }

    it('loads data synchronously', function (done) {
      Sync(function () {
        var stats = cache.get('./package.json');
        stats.should.exist;
        stats.should.deep.equal(fs.statSync('./package.json'));
        done();
      });
    });

    it('retrieves data from the cache when it exists', function (done) {
      Sync(function () {
        var stat1 = cache.get('./package.json');
        var stat2 = cache.get('./package.json');
        stat1.should.equal(stat2);
        done();
      });
    });

    it('returns stale data from the cache when allow stale is true', function (done) {
      Sync(function () {
        cache = new SyncCache({load: stat, maxAge: 1, stale: true});
        var stat1 = cache.get('./package.json');
        Sync.sleep(2);
        var stat2 = cache.get('./package.json');
        stat1.should.equal(stat2);
        done();
      });
    });

    it('does not return stale data from the cache when allow stale is not true', function (done) {
      Sync(function () {
        cache = new SyncCache({load: stat, maxAge: 1});
        var stat1 = cache.get('./package.json');
        Sync.sleep(2);
        var stat2 = cache.get('./package.json');
        stat1.should.not.equal(stat2);
        stat1.should.deep.equal(stat2);
        done();
      });
    });
  });

});
