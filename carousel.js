/*! Carousel.js v0.0.1 - MIT license */

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
    loop: true
  };

  options || (options = {});

  _.extend(this, carouselDefaults, _.pick(options, carouselOptions));
}

var carouselOptions = ['pageWidth', 'loop'];

_.extend(Carousel.prototype, {

});

/**
 * Expose carousel
 */

return Carousel;

// ---------------------------------------------------------------------------

} if (typeof exports === 'object') {
    // node export
    module.exports = moduleDefinition(require('lodash'));
} else if (typeof define === 'function' && define.amd) {
    // amd anonymous module registration
    define([require('lodash')], moduleDefinition);
} else {
    // browser global
    global.Carousel = moduleDefinition(global._);
}}(this));
