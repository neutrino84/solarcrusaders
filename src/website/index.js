var jquery = require('jquery'),
    fullPage = require('fullpage'),
    slick = require('slick');

jquery(document).ready(function() {
  // loaded
  jquery('#window').removeClass('loading');

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
});
