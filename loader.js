var nconf = require('nconf'),
    fs = require('fs'),
    path = require('path'),
    async = require('async'),

    configFilePath = path.join(__dirname, 'config.json'),
    pidFilePath = path.join(__dirname, 'pidfile'),

    File = require('./src/utils/File'),
    Loader = require('./src/Loader');

fs.open(configFilePath, 'r', function(err) {
  var pid, loader;
  if(!err) {
    // configure nconf
    nconf.argv().env().file({
      file: configFilePath
    });

    loader = new Loader(nconf);
    loader.init();
    loader.displayStartupMessages();
    loader.start();

    if(nconf.get('daemonize-process') !== 'false' && nconf.get('daemonize-process') !== false) {
      if(File.existsSync(pidFilePath)) {
        try {
          pid = fs.readFileSync(pidFilePath, { encoding: 'utf-8' });
          process.kill(pid, 0);
          process.exit();
        } catch (e) {
          fs.unlinkSync(pidFilePath);
        }
      }

      require('daemonize-process')({
        stdout: process.stdout,
        stderr: process.stderr
      });

      fs.writeFile(__dirname + '/pidfile', process.pid);
    }
  } else {
    console.log('Missing master configuation file.');
  }
});
