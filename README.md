
# solarcrusaders
## install notes

#### install and run redis-server

##### You will need to have a redis instance running locally.

Install on [OSX](http://jasdeep.ca/2012/05/installing-redis-on-mac-os-x/)

Install on Windows Subsystem for Linux:

    apt-get install redis-server

#### initialize required packages

##### You will need to install nodejs, bower, and grunt.

Install nodejs on OSX:
    
    brew install node

Install nodejs on Windows Subsystem for Linux:
    
    // you can use node --version 4.x or 6.x
    curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
    sudo apt-get install -y nodejs

Install bower and grunt:

    sudo npm install -g bower
    sudo npm install -g grunt-cli

Install solarcrusaders required packages

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
    mkdir ./logs
    touch ./logs/loader.log
    touch ./logs/server.log

## Run the game server in Windows Subsystem for Linux

It is recommended that you clone solarcrusaders into /mnt/c/Users/name/Documents/ if you'd like to use Sublime or Windows IDE to edit project src files.

#### start redis

    sudo service redis-server start

#### build core and solar client javascript

Then run:

    grunt build:core
    grunt build:solar

Every time you make changes to ./solarcrusaders/src/* you will need to re-run:

    grunt build:solar

#### run in development mode

    node app.js

## Run the game server in OSX or Linux

#### start redis-server

    redis-server

#### run in development mode

    grunt

#### run in production mode

    ./solarcrusaders start

## See if your local game server is running

Open a web browser and navigate to http://play.localhost.dev:4567/
