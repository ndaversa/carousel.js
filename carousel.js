/*!
 * Carousel.js v1.0.0 ~ Copyright (c) 2013 Nino D'Aversa, http://ndaversa.com
 * Released under MIT license
 */

;(function (global) { function moduleDefinition(_, $) {
'use strict';

// ---------------------------------------------------------------------------
// Browser and Feature Detection

var dummyStyle = document.createElement('div').style,
  vendor = (function () {
    var vendors = 't,webkitT,MozT,msT,OT'.split(','),
      t,
      i = 0,
      l = vendors.length;

    for ( ; i < l; i++ ) {
      t = vendors[i] + 'ransform';
      if ( t in dummyStyle ) {
        return vendors[i].substr(0, vendors[i].length - 1);
      }
    }

    return false;
  })(),
  cssVendor = vendor ? '-' + vendor.toLowerCase() + '-' : '',

  // Style properties
  transform = prefixStyle('transform'),
  transitionDuration = prefixStyle('transitionDuration'),

  // Browser capabilities
  has3d = prefixStyle('perspective') in dummyStyle,
  hasTouch = 'ontouchstart' in window,
  hasTransform = !!vendor,
  hasTransitionEnd = prefixStyle('transition') in dummyStyle,

  // Helpers
  translateZ = has3d ? ' translateZ(0)' : '',

  // Events
  resizeEvent = 'onorientationchange' in window ? 'orientationchange' : 'resize',
  startEvent = hasTouch ? 'touchstart' : 'mousedown',
  moveEvent = hasTouch ? 'touchmove' : 'mousemove',
  endEvent = hasTouch ? 'touchend' : 'mouseup',
  cancelEvent = hasTouch ? 'touchcancel' : 'mouseup',
  transitionEndEvent = (function () {
    if ( vendor === false ) return false;

    var transitionEnd = {
      '': 'transitionend',
      'webkit': 'webkitTransitionEnd',
      'Moz': 'transitionend',
      'O': 'oTransitionEnd',
      'ms': 'MSTransitionEnd'
    };

    return transitionEnd[vendor];
  })();

function prefixStyle (style) {
  if ( vendor === '' ) return style;

  style = style.charAt(0).toUpperCase() + style.substr(1);
  return vendor + style;
}



// ---------------------------------------------------------------------------
// Carousel.js

function Carousel(options) {
  options || (options = {});
  this._configure(options);
  this.$el = $(this.el);
  this.el = this.$el[0];
}

var carouselOptions = ['pageWidth', 'loop', 'el', 'bufferPages'];
_.extend(Carousel.prototype, {

  _configure: function (options) {
    var carouselDefaults = {
      loop: true,
      bufferPages: 2
    };
    _.extend(this, carouselDefaults, _.pick(options, carouselOptions));
  },

  render: function () {
    var slider = $('<div class="slider"/>');
    slider.css({
      position: 'relative',
      top: '0px',
      height: '100%',
      width: '100%',
      transitionDuration: '0s',
      transitionTimingFunction: 'ease-out',
      transform: 'translateZ(0)'
    });

    this.$el.css({
      position: 'relative',
      overflow: 'hidden'
    }).append(slider);

    return this;
  }

});
return Carousel;

// ---------------------------------------------------------------------------
// Module Definition

} if (typeof exports === 'object') {
    module.exports = moduleDefinition(require('lodash'), require('jquery'));
} else if (typeof define === 'function' && define.amd) {
    define([require('lodash'), require('jquery')], moduleDefinition);
} else {
    global.Carousel = moduleDefinition(global._, global.$);
}}(this));
