
var fs = require('fs'),
    path = require('path'),
    url = require('url'),
    fork = require('child_process').fork,
    logrotate = require('logrotate-stream'),
    pkg = require('../package.json'),

    pidFilePath = path.join(__dirname, '../pidfile'),

    File = require('./utils/File');

function Loader(nconf) {
  this.numProcs;
  this.workers = [],
  this.timesStarted = 0;
  this.nconf = nconf;

  this.silent = nconf.get('silent') === 'false' ? false : nconf.get('silent') !== false;
  this.output = logrotate({ file: __dirname + '/../logs/loader.log', size: '1m', keep: 3, compress: true });
};

Loader.prototype.constructor = Loader;

Loader.prototype.init = function() {
  var Loader = this;

  if(this.silent) {
    console.log = function(value) {
      Loader.output.write(value + '\n');
    };
  }

  process.on('SIGHUP', this.restart.bind(this));
  process.on('SIGUSR2', this.reload.bind(this));
  process.on('SIGTERM', this.stop.bind(this));
  process.on('SIGINT', this.stop.bind(this));
};

Loader.prototype.displayStartupMessages = function() {
  console.log('');
  console.log('Solar Crusaders v' + pkg.version + ' Copyright (C) 2015-2016 Puremana Studios LLC');
};

Loader.prototype.start = function() {
  var numProcs = this.numProcs = this._getPorts().length;
  
  console.log('Clustering enabled: Spinning up ' + numProcs + ' process(es).\n');

  for(var x=0; x<numProcs; ++x) {
    this._forkWorker(x, x === 0);
  }
};

Loader.prototype.stop = function() {
  this._killWorkers();

  // Clean up the pidfile
  File.exists(pidFilePath, function(exists) {
    if(exists) {
      fs.unlinkSync(pidFilePath);
    }
  });
};

Loader.prototype.restart = function() {
  this._killWorkers();

  this.start();
};

Loader.prototype.reload = function() {
  this.workers.forEach(function(worker) {
    worker.send({ action: 'reload' });
  });
};

Loader.prototype.addWorkerEvents = function(worker) {
  var self = this;

  worker.on('exit', function(code, signal) {
    if(code !== 0) {
      if(self.timesStarted < self.numProcs * 3) {
        self.timesStarted++;
        if(self.crashTimer) {
          clearTimeout(self.crashTimer);
        }
        self.crashTimer = setTimeout(function() {
          self.timesStarted = 0;
        }, 10000);
      } else {
        console.log(self.numProcs * 3 + ' restarts in 10 seconds, most likely an error on startup. Halting.');
        
        process.exit();
      }
    }

    console.log('Child Process (' + worker.pid + ') has exited (code: ' + code + ', signal: ' + signal +')');
    
    if(!(worker.suicide || code === 0)) {
      console.log('Spinning up another process...');

      self._forkWorker(worker.index, worker.isPrimary);
    }
  });

  worker.on('message', function(message) {
    if(message && typeof message === 'object' && message.action) {
      switch(message.action) {
        case 'ready':
          console.log('Ready...');
          break;
        case 'restart':
          console.log('Restarting...');
          self.restart();
          break;
        case 'reload':
          console.log('Reloading...');
          self.reload();
          break;
      }
    }
  });
};

Loader.prototype.notifyWorkers = function(msg, worker_pid) {
  worker_pid = parseInt(worker_pid, 10);
  this.workers.forEach(function(worker) {
    if(parseInt(worker.pid, 10) !== worker_pid) {
      try {
        worker.send(msg);
      } catch (e) {
        console.log('Failed to reach pid ' + worker_pid);
      }
    }
  });
};

Loader.prototype._forkWorker = function(index, isPrimary) {
  var debugArgIdx,
      worker, output,
      ports = this._getPorts(),
      debugArgs = ['--debug', '--debug-brk'];

  if(!ports[index]) {
    return console.log('invalid port for worker : ' + index + ' ports: ' + ports.length);
  }

  process.env.isPrimary = isPrimary;
  process.env.isCluster = true;
  process.env.port = ports[index];

  // debugging fix
  for(var a in debugArgs) {
    debugArgIdx = process.execArgv.indexOf(debugArgs[a]);
    if(debugArgIdx !== -1) {
      process.execArgv.splice(debugArgIdx, 1);
      process.execArgv.push(debugArgs[a] + '=' + (5859 + index))
    }
  }

  worker = fork('./app.js', [], {
    silent: this.silent,
    env: process.env
  });

  // reference worker
  this.workers[index] = worker;

  // configure worker
  worker.index = index;
  worker.isPrimary = isPrimary;

  this.addWorkerEvents(worker);

  if(this.silent) {
    output = logrotate({ file: __dirname + '/../logs/server.log', size: '1m', keep: 3, compress: true });
    worker.stdout.pipe(output);
    worker.stderr.pipe(output);
  }

  console.log('Child Process (' + worker.pid + ') on port ' + ports[index] + ' has launched.');
};

Loader.prototype._getPorts = function() {
  var urlObject, port,
      nconf = this.nconf,
      u = nconf.get('url');
  if(!u) {
    console.log('url is undefined, please check your config.json');
    process.exit();
  }

  urlObject = url.parse(u);
  port = nconf.get('port') || nconf.get('PORT') || urlObject.port || 4567;
  
  if(!Array.isArray(port)) {
    port = [port];
  }
  return port;
};

Loader.prototype._killWorkers = function() {
  this.workers.forEach(function(worker) {
    worker.suicide = true;
    worker.kill();
  });
};

module.exports = Loader;
