var jquery = require('jquery'),
    fullPage = require('fullpage'),
    slick = require('slick'),
    magnific = require('magnific');

var global = {};

function resize() {
  var width = jquery(window).width();
  if(width <= 773) {
    if(!global.slides) {
      //.. create slides
      global.slides = jquery('#prordr .description').slick({
        accessibility: false,
        arrows: false,
        easing: 'easeInOutCubic',
        slide: '.column',
        slidesToShow: 1,
        slidesToScroll: 1,
        centerMode: true,
        centerPadding: '50px',
        initialSlide: 2,
        mobileFirst: true
      });
    }
  } else if(global.slides) {
    global.slides.slick('unslick');
    global.slides = undefined;
  }
};

jquery(window).on('resize', resize);
jquery(document).ready(function() {
  // resize
  resize();

  // fullpage
  jquery('#window').fullpage({
    // loopBottom: true,
    animateAnchor: false,
    menu: '#navigation',
    anchors: ['home', 'about', 'races', 'preorder'],
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
    fade: true,
    mobileFirst: true
  });

  // navigation popup
  jquery('#navigation li.menu').magnificPopup({
    items: {
      type: 'inline',
      src: '#mobilenavigation'
    }
  });
  jquery('#mobilenavigation li a').on('click', function() {
    jquery.magnificPopup.close();
  });

  // loaded
  jquery('#window').removeClass('loading');
});
