/*!
 * Carousel.js v1.0.0 ~ Copyright (c) 2013 Nino D'Aversa, http://ndaversa.com
 * Released under MIT license
 */

;(function (global) { function moduleDefinition(_, $) {
'use strict';

// ---------------------------------------------------------------------------
// Browser and Feature Detection

var dummyStyle = document.createElement('div').style,
  hasTouch = 'ontouchstart' in window,

  // Events
  resizeEvent = 'onorientationchange' in window ? 'orientationchange' : 'resize',
  startEvent = hasTouch ? 'touchstart' : 'mousedown',
  moveEvent = hasTouch ? 'touchmove' : 'mousemove',
  endEvent = hasTouch ? 'touchend' : 'mouseup',
  cancelEvent = hasTouch ? 'touchcancel' : 'mouseup';

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
      transform: 'translate3d(0px, 0px, 0px)'
    });

    this.$el.css({
      position: 'relative',
      overflow: 'hidden'
    }).html(slider);

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
