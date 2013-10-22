/*!
 * Carousel.js v1.0.0 ~ Copyright (c) 2013 Nino D'Aversa, http://ndaversa.com
 * Released under MIT license
 */

;(function (global) { function moduleDefinition(_) {

// ---------------------------------------------------------------------------

'use strict';

/**
 * @param {}
 * @return {}
 * @api public
 */

function Carousel(options) {
  var carouselDefaults = {
    loop: true,
    bufferPages: 2
  };
  options || (options = {});
  _.extend(this, carouselDefaults, _.pick(options, carouselOptions));

  this.el = typeof this.el == 'string' ? document.querySelector(this.el) : this.el;
}

var carouselOptions = ['pageWidth', 'loop', 'el', 'bufferPages'];

_.extend(Carousel.prototype, {

  render: function () {
    this.el.style.overflow = 'hidden';
    this.el.style.position = 'relative';
    return this;
  }
});

return Carousel;

// ---------------------------------------------------------------------------

} if (typeof exports === 'object') {
    module.exports = moduleDefinition(require('lodash'));
} else if (typeof define === 'function' && define.amd) {
    define([require('lodash')], moduleDefinition);
} else {
    global.Carousel = moduleDefinition(global._);
}}(this));
