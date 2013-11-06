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
      this.current.page = 0;
    }
    else {
      this.current.page = this.bufferPages;
    }
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

    if (this.loop) {
      this.page = new Array(this.bufferPages * 2 + 1);
      this.offset = this.bufferPages;

      for (var i=this.current.page-1; i>=0; i--) {
        var data = this.data[dataIndex-- % this.data.length],
          x = (i - this.offset) * this.pageWidth;

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
    }
    else {
      this.page = new Array(Math.min(this.bufferPages * 2 + 1, this.data.length));
      this.offset = 0;
    }

    dataIndex = 0;
    for (var i=this.current.page; i<this.page.length; i++) {
      var data = this.data[dataIndex++ % this.data.length],
        x = (i - this.offset) * this.pageWidth;

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
    var rightMostPage = this.indexShift(this.current.page, this.bufferPages, this.page.length),
      leftMostPage = this.indexShift(this.current.page, -this.bufferPages, this.page.length),
      nextRightData = this.indexShift(this.page[rightMostPage].dataIndex, 1, this.data.length),
      nextLeftData = this.indexShift(this.page[leftMostPage].dataIndex, -1, this.data.length);

    if (previous < current) { //swiped to the left (show more on right)
      this.page[leftMostPage].data = this.data[nextRightData];
      this.page[leftMostPage].dataIndex = nextRightData;
      this.page[leftMostPage].x = this.page[rightMostPage].x + this.pageWidth;
      this.page[leftMostPage].$el
        .css('left', this.page[leftMostPage].x + 'px')
        .html(this.template(this.page[leftMostPage].data));
    }
    else { //swiped to the right (show more on left)
      //take the right-most page and move it to the left-most
      this.page[rightMostPage].data = this.data[nextLeftData];
      this.page[rightMostPage].dataIndex = nextLeftData;
      this.page[rightMostPage].x = this.page[leftMostPage].x - this.pageWidth;
      this.page[rightMostPage].$el
        .css('left', this.page[rightMostPage].x + 'px')
        .html(this.template(this.page[rightMostPage].data));
    }
    this.current.page = current;
  },

  _start: function (evt) {
    this.start.x = evt.originalEvent.touches[0].pageX;
    this.touches = [];
    this.touches.push(this.start.x);
    console.log('start.x', this.start.x);
  },

  _move: function (evt) {
    this.move.x = evt.originalEvent.touches[0].pageX;
    this.touches.push(this.move.x);
    console.log('move.x', this.move.x);
    this.delta.x = this.move.x - this.start.x;
    this.next.x = this.current.x + this.delta.x;
    this.slider.css({
      transform: 'translate3d(' + this.next.x + 'px, 0, 0)'
    });
  },

  _end: function (evt) {
    console.log('end', this.touches);
    this.touches = [];
    this.current.x = this.next.x;
    this.next.page = Math.floor(-this.current.x / this.pageWidth) + this.offset;
    if (this.current.page !== this.next.page) {
      this.crossBoundary(this.current.page, this.next.page);
    }
  },

  _cancel: function (evt) {
    console.log('CANCEL');
    //TODO: how to treat this? same as _end or rollback interaction?
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
