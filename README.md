
# solarcrusaders
## install notes

#### install and run redis-server

You will need to have a redis instance running locally.
* [Windows](https://github.com/MSOpenTech/redis)
* [OSX](http://jasdeep.ca/2012/05/installing-redis-on-mac-os-x/)

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
      "secret": "",
      "database": "redis",
      "redis": {
        "host": "127.0.0.1",
        "port": "6379",
        "password": "",
        "database": "1",
        "options": {}
      }
    }

#### create log files
    
    // make sure you're in the
    // root solarcrusaders directory
    mkdir /logs
    touch /logs/loader.log
    touch /logs/server.log

#### start redis

    sudo service redis-server start

## Run in Windows 10 Ubuntu Subsystem

#### run without app loader

    node app.js

## Run in OSX or Linux

#### run in development mode

    grunt

#### run without development packages

    ./solarcrusaders start
