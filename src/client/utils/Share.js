
function Share() {
  var self = this;
  setTimeout(function() {
    var d = global.document,
        el = d.getElementById('share');
    
    // load share libraries
    self.init('facebook-jssdk', Share.FACEBOOK_SDK_URL);
    self.init('twitter-wjs', Share.TWITTER_SDK_URL);
    self.init('tumblr-js', Share.TUMBLR_SDK_URL);

    // show block
    el.style.display = 'block';
  }, 3000);
};

Share.FACEBOOK_SDK_URL = '//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.4&appId=1474463249448141';
Share.TWITTER_SDK_URL = '//platform.twitter.com/widgets.js';
Share.TUMBLR_SDK_URL = 'https://secure.assets.tumblr.com/share-button.js';

Share.prototype.constructor = Share;

Share.prototype.init = function(id, src) {
  var d = global.document,
      s = 'script',
      js, fjs = d.getElementsByTagName(s)[0];
  
  // create script
  js = d.createElement(s);
  js.id = id;
  js.src = src;

  // add to dom
  fjs.parentNode.insertBefore(js, fjs);
};

module.exports = Share;
