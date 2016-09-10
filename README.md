
# solarcrusaders
## install notes

#### install and run redis-server

##### You will need to have a redis instance running locally.

Install on [OSX](http://jasdeep.ca/2012/05/installing-redis-on-mac-os-x/)

Install on Windows Subsystem for Linux:

    apt-get install redis-server

#### initialize required packages

    npm install
    bower install

#### update your hosts file

    // Linux/OSX: /etc/hosts
    // Windows 10: C:\Windows\System32\Drivers\etc\hosts

    #
    # Hosts file
    #
    127.0.0.1   localhost
    127.0.0.1   localhost.dev
    127.0.0.1   www.localhost.dev
    127.0.0.1   play.localhost.dev

#### update config.json

    {
      "silent": false,
      "daemon": false,
      "production": false,
      "url": "http://localhost.dev:4567",
      "secret": "secret",
      "database": "redis",
      "redis": {
        "host": "127.0.0.1",
        "port": "6379",
        "password": "",
        "database": "0",
        "options": {}
      }
    }

#### create log files
    
    // make sure you're in the
    // root solarcrusaders directory
    mkdir /logs
    touch /logs/loader.log
    touch /logs/server.log

## Run in Windows Subsystem for Linux

It is recommended that you clone solarcrusaders into /mnt/c/Users/*/Documents/* if you'd like to use Sublime or Windows IDE to edit project src files.

#### start redis

    sudo service redis-server start

#### build core and solar client javascript

First comment out all lines with "watch: true" in Gruntfile.js, there should be 3 instances. Windows Subsystem for Linux does not yet properly support watching files for changes.

Then run:

    grunt build:core
    grunt build:solar

Every time you make changes to ./solarcrusaders/src/* you will need to re-run:

    grunt build:solar

#### run without app loader

    node app.js

## Run in OSX or Linux

#### start redis-server

    redis-server

#### run in development mode

    grunt

#### run without development packages

    ./solarcrusaders start
