var jquery = require('jquery'),
    fullPage = require('fullpage'),
    slick = require('slick');

jquery(document).ready(function() {
  // fullpage
  jquery('#window').fullpage({
  	// loopBottom: true,
    animateAnchor: false,
    menu: '#navigation',
    anchors: ['home', 'about', 'races'],
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
  jquery('#abt .screenshot').slick({
    dots: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 2000,
    easing: 'easeInOutCubic',
   	slide: '.img',
    arrows: false
  });
});