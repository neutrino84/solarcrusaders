var jquery = require('jquery'),
    fullPage = require('fullpage'),
    slick = require('slick'),
    drop = require('drop');

jquery(document).ready(function() {
  // fullpage
  jquery('#window').fullpage({
  	// loopBottom: true,
    animateAnchor: false,
    menu: '#navigation',
    anchors: ['home', 'about', 'races'], //, 'preorder'],
    onLeave: function(index, nextIndex) {
      if(nextIndex === 1) {
        jquery('#gradient').css('opacity', '0');
      	jquery('#logo').removeClass('show');
      } else {
        jquery('#gradient').css('opacity', '1');
      	jquery('#logo').addClass('show');
      }
    }
  });

  // slick
  jquery('#abt .ships').slick({
    dots: true,
    speed: 1000,
    autoplay: true,
    autoplaySpeed: 1000,
    easing: 'easeInOutCubic',
   	slide: '.ship',
    slidesToShow: 1,
    slidesToScroll: 1,
    centerMode: true,
    arrows: false,
    infinite: true,
    fade: true
  });

  // mobilemenu
  jquery('#mobilenavigation').removeAttr('style');

  // drop
  var dropInstance = new drop({
    target: jquery('#navigation li.menu').get(0),
    content: jquery('#mobilenavigation').get(0),
    classes: '',
    position: 'bottom right',
    openOn: 'click'
  });

  // loaded
  jquery('#window').removeClass('loading');
});
