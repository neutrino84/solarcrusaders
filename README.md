
# solarcrusaders
## install notes

#### install and run redis-server

You will need to have a redis instance running locally.
* [Windows](https://github.com/MSOpenTech/redis)
* [OSX](http://jasdeep.ca/2012/05/installing-redis-on-mac-os-x/) *homebrew recommended

    npm install
    bower install
    grunt

#### update your hosts file

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
      "secret": "121daf16-401d-409b-8b63-12232c0a211c",
      "database": "redis",
      "redis": {
        "host": "127.0.0.1",
        "port": "6379",
        "password": "",
        "database": "1",
        "options": {}
      }
    }
