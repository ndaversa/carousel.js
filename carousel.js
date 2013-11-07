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

  this.start = {x: 0, page:0};
  this.move = {x: 0, page: 0};
  this.delta = {x: 0, page: 0};
  this.next = {x: 0, page:0};
  this.current = {x: 0, page:0};
  this.limit = {left: {x: 0}, right: {x:0}};

  this._configure(options);
  this.$el = $(this.el);
  this.el = this.$el[0];
}

var carouselOptions = [
  'bufferPages',
  'data',
  'el',
  'loop',
  'pageTemplate',
  'pageWidth',
  'template',
];

_.extend(Carousel.prototype, {

  _configure: function (options) {
    var carouselDefaults = {
      loop: true,
      data: [],
      bufferPages: 2,
      pageWidth: 256
    };
    _.extend(this, carouselDefaults, _.pick(options, carouselOptions));
    if (!this.loop) {
      this.limit.left.x = 0;
      this.limit.right.x = (this.data.length - 1) * -this.pageWidth;
    }
    else {
      this.limit.left.x = Infinity;
      this.limit.right.x = -Infinity;
    }
    this.current.page = this.bufferPages;
  },

  pageTemplate: function (data) {
    data = data || { content: '' };
    return '<li style="width:' + this.pageWidth + 'px;">' + this.template(data) + '</li>';
  },

  template: function (data) {
    data = data || { content: '' };
    return '' + data.content;
  },

  initPages: function () {
    var dataIndex = this.data.length - 1;

    this.page = new Array(this.bufferPages * 2 + 1);

    // Build left buffer pages
    for (var i=this.current.page-1; i>=0; i--) {
      var data = this.loop ? this.data[dataIndex-- % this.data.length] : undefined,
        x = (i - this.bufferPages) * this.pageWidth;

      this.page[i] = {
        x: x,
        dataIndex: dataIndex + 1,
        data: data,
        $el: $(this.pageTemplate(data)).css({
          position: 'absolute',
          left: x + 'px'
        })
      };
    }

    dataIndex = 0;
    for (var i=this.current.page; i<this.page.length; i++) {
      var data,
        x = (i - this.bufferPages) * this.pageWidth;

      if (!this.loop && dataIndex > this.data.length - 1) {
        data = undefined;
      }
      else {
        data = this.data[dataIndex++ % this.data.length];
      }

      this.page[i] = {
        x: x,
        dataIndex: dataIndex - 1,
        data: data,
        $el: $(this.pageTemplate(data)).css({
          position: 'absolute',
          left: x + 'px'
        })
      };
    }
  },

  initSlider: function () {
    this.slider = $('<ul class="slider"/>');
    this.slider.css({
      position: 'relative',
      top: '0px',
      height: '100%',
      width: '100%',
      transitionDuration: '0s',
      transitionTimingFunction: 'ease-out',
      transform: 'translate3d(0px, 0px, 0px)'
    })
    .on('touchstart', _.bind(this._start, this))
    .on('touchmove', _.bind(this._move, this))
    .on('touchend', _.bind(this._end, this))
    .on('touchcancel', _.bind(this._cancel, this));
  },

  appendPages: function () {
    for (var i=0; i<this.page.length; i++) {
      this.slider.append(this.page[i].$el);
    }
  },

  render: function () {
    this.initPages();
    this.initSlider();
    this.appendPages();

    this.$el.css({
      position: 'relative',
      overflow: 'hidden'
    }).html(this.slider);

    return this;
  },

  indexShift: function (current, amt, size) {
    return (size + ((current + amt) % size)) % size;
  },

  crossBoundary: function (previous, current) {
    var rightMostPage = _.max(this.page, function(page) { return page.x; }),
        leftMostPage  = _.min(this.page, function(page) { return page.x; }),
        nextRightData = this.indexShift(rightMostPage.dataIndex, 1, this.data.length),
        nextLeftData  = this.indexShift(leftMostPage.dataIndex, -1, this.data.length);

    if (previous < current) { //swiped to the left (show more on right)
      if (this.loop || nextRightData !== 0) {
        leftMostPage.data = this.data[nextRightData];
        leftMostPage.dataIndex = nextRightData;
        leftMostPage.x = rightMostPage.x + this.pageWidth;
        leftMostPage.$el
          .css('left', leftMostPage.x + 'px')
          .html(this.template(leftMostPage.data));
      }
    }
    else { //swiped to the right (show more on left)
      if (this.loop || nextLeftData !== this.data.length - 1) {
        rightMostPage.data = this.data[nextLeftData];
        rightMostPage.dataIndex = nextLeftData;
        rightMostPage.x = leftMostPage.x - this.pageWidth;
        rightMostPage.$el
          .css('left', rightMostPage.x + 'px')
          .html(this.template(rightMostPage.data));
      }
    }
    this.current.page = current;
  },

  _start: function (evt) {
    this.start.x = evt.originalEvent.touches[0].pageX;
    this.touches = [];
    this.touches.push(this.start.x);
  },

  _move: function (evt) {
    evt.preventDefault(); //needed for Android 2.3

    this.move.x = evt.originalEvent.touches[0].pageX;
    this.touches.push(this.move.x);
    this.delta.x = this.move.x - this.start.x;
    this.next.x = this.current.x + this.delta.x;

    if (this.next.x > this.limit.left.x) { //left-most limit
      this.next.x -= Math.round(this.delta.x/2);
    }
    else if (this.next.x < this.limit.right.x) { //right-most limit
      this.delta.bounce = this.limit.right.x - this.next.x;
      this.next.x = this.limit.right.x - Math.round(this.delta.bounce/2);
    }

    this.slider.css({
      transform: 'translate3d(' + this.next.x + 'px, 0, 0)',
      transition: '0s'
    });
  },

  _end: function (evt) {
    var animateBack = false;

    // console.log('_end, touches', this.touches);
    this.touches = [];

    if (this.next.x > this.limit.left.x) { //left-most limit
      this.next.x = this.limit.left.x;
      animateBack = true;
    }
    else if (this.next.x < this.limit.right.x) { //right-most limit
      this.next.x = this.limit.right.x;
      animateBack = true;
    }

    if (animateBack) {
      this.slider.css({
        transform: 'translate3d(' + this.next.x + 'px, 0, 0)',
        transition: '300ms'
      });
    }

    this.current.x = this.next.x;
    this.next.page = Math.floor(-this.current.x / this.pageWidth) + this.bufferPages;
    if (this.current.page !== this.next.page) {
      this.crossBoundary(this.current.page, this.next.page);
    }
  },

  _cancel: function (evt) {
    this._end(evt);
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
