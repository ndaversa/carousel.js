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
  transitionEndEvent = 'webkitTransitionEnd transitionend',

// ---------------------------------------------------------------------------
// Carousel.js

function Carousel(options) {
  options || (options = {});

  this.container = {width: 0};
  this.current = {x: 0, page:0};
  this.delta = {x: 0, page: 0};
  this.limit = {left: {x: 0}, right: {x:0}};
  this.next = {x: 0, page:0};
  this.pages = {visible: 0, total: 0, buffer:0};
  this.start = {x: 0, page:0};

  this._configure(options);
}

var carouselOptions = [
  'animationDuration',
  'data',
  'delayBuffers',
  'el',
  'initialOffset',
  'loop',
  'pageTemplate',
  'pageWidth',
  'template',
  'templateOptions',
];

_.extend(Carousel.prototype, {

  _configure: function (options) {
    var carouselDefaults = {
      animationDuration: 0.325,
      data: [],
      delayBuffers: false,
      loop: true,
      pageWidth: 256,
      templateOptions: {},
    };
    _.extend(this, carouselDefaults, _.pick(options, carouselOptions));
    _.bindAll(this,
      'crossBoundary',
      '_start',
      '_move',
      '_end',
      '_cancel',
      '_transitionEnd',
      '_resize'
    );

    this.$el = $(this.el);
    this.el = this.$el[0];
    this.slider = $('<ul class="slider"/>');

    this._resize();

    this.pages.side = Math.ceil(this.container.width / this.pageWidth);
    this.pages.visible = _.range(this.pages.side, 2 * this.pages.side);
    this.pages.total = this.pages.side * 3;

    this.current.page = this.pages.side;

    if (this.initialOffset) {
      this.current.x = this.initialOffset;
    }

    this.rendered = false;
  },

  pageTemplate: function () {
    return '<li style="width:' + this.pageWidth + 'px;"></li>';
  },

  template: function (data, options) {
    data = data || {};
    data.content = data.content || '';
    return '' + data.content;
  },

  initPages: function () {
    var dataIndex = this.data.length - 1;

    this.page = new Array(this.pages.total);

    // Build left buffer pages
    for (var i=this.current.page-1; i>=0; i--) {
      var data = this.loop ? this.data[dataIndex-- % this.data.length] : {},
        x = (i - this.pages.side) * this.pageWidth;

      this.page[i] = {
        x: x,
        dataIndex: dataIndex + 1,
        data: data,
        $el: $(this.pageTemplate()).css({
          position: 'absolute',
          left: x + 'px'
        })
      };
    }

    dataIndex = 0;
    for (var i=this.current.page; i<this.page.length; i++) {
      var data,
        x = (i - this.pages.side) * this.pageWidth;

      if (!this.loop && dataIndex > this.data.length - 1) {
        data = {};
      }
      else {
        data = this.data[dataIndex++ % this.data.length];
      }

      this.page[i] = {
        x: x,
        dataIndex: dataIndex - 1,
        data: data,
        $el: $(this.pageTemplate()).css({
          position: 'absolute',
          left: x + 'px'
        })
      };
    }
  },

  initSlider: function () {
    this.slider.css({
      position: 'relative',
      top: '0px',
      height: '100%',
      width: '100%',
      transitionDuration: '0s',
      transitionTimingFunction: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
      transform: 'translate3d(' + this.current.x + 'px, 0px, 0px)'
    })
    .on(startEvent, this._start)
    .on(moveEvent, this._move)
    .on(endEvent, this._end)
    .on(cancelEvent, this._cancel);

    $(window).on(resizeEvent, this._resize);
  },

  renderPages: function () {
    _(this.pages.visible).each(function (i) {
      this.page[i].$el.html(this.template(this.page[i].data, this.templateOptions));
      this.slider.append(this.page[i].$el);
    }, this);

    this.renderBuffers(this.delayBuffers);
  },

  renderBuffers: function (withoutData) {
    var right = (this.current.page + this.pages.visible.length),
      left = 0;

    for (; right<this.page.length; right++) {
      if (!withoutData) {
        this.page[right].$el.html(this.template(this.page[right].data, this.templateOptions));
      }
      this.slider.append(this.page[right].$el);
    }

    for (; left<this.current.page; left++) {
      if (!withoutData) {
        this.page[left].$el.html(this.template(this.page[left].data, this.templateOptions));
      }
      this.slider.append(this.page[left].$el);
    }

    if (!withoutData) {
      this.rendered = true;
    }
  },

  render: function () {
    this.initPages();
    this.initSlider();
    this.renderPages();

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
        currentData   = this.indexShift(leftMostPage.dataIndex, this.pages.side, this.data.length),
        nextRightData = this.indexShift(rightMostPage.dataIndex, 1, this.data.length),
        nextLeftData  = this.indexShift(leftMostPage.dataIndex, -1, this.data.length);

    if (previous < current) { //swiped to the left (show more on right)
      if (this.loop || nextRightData > currentData) {
        leftMostPage.data = this.data[nextRightData];
      }
      else {
        leftMostPage.data = {};
      }
      leftMostPage.dataIndex = nextRightData;
      leftMostPage.x = rightMostPage.x + this.pageWidth;
      leftMostPage.$el
        .css('left', leftMostPage.x + 'px')
        .html(this.template(leftMostPage.data, this.templateOptions));
    }
    else { //swiped to the right (show more on left)
      if (this.loop || nextLeftData < currentData) {
        rightMostPage.data = this.data[nextLeftData];
      }
      else {
        rightMostPage.data = {};
      }
      rightMostPage.dataIndex = nextLeftData;
      rightMostPage.x = leftMostPage.x - this.pageWidth;
      rightMostPage.$el
        .css('left', rightMostPage.x + 'px')
        .html(this.template(rightMostPage.data, this.templateOptions));
    }
    this.current.page = current;
  },

  _enforceLimits: function () {
    var changed = false;

    if (this.current.x > this.limit.left.x) {
      this.current.x = this.limit.left.x;
      changed = true;
    }
    else if (this.current.x < this.limit.right.x) {
      this.current.x = this.limit.right.x;
      changed = true;
      if (this.current.x > this.limit.left.x) {
        this.current.x = this.limit.left.x;
      }
    }

    return changed;
  },

  _start: function (evt) {
    if (!this.rendered) this.renderBuffers();
    var point = hasTouch ? evt.originalEvent.touches[0] : evt.originalEvent;
    this.start.x = point.pageX;
    this.start.y = point.pageY;
    this.initiated = true;

    this.start.timeStamp = evt.originalEvent.timeStamp;
    this.touches = [];
    this.touches.push(this.start);

    this.slider.css({
      transitionDuration: '0s'
    });
  },

  _move: function (evt) {
    if (!this.initiated) return;
    var point = hasTouch ? evt.originalEvent.touches[0] : evt.originalEvent,
      move = { x: point.pageX, y: point.pageY, timeStamp: evt.originalEvent.timeStamp };
    this.delta.x = move.x - this.start.x;
    this.delta.y = move.y - this.start.y;

    if (this.animating) this._transitionEnd(); //cleanup running animation

    if (Math.abs(this.delta.y) > Math.abs(this.delta.x)) {
      this._end()
      return;
    }

    evt.preventDefault(); // needed on Android 2.3 to get more `touchmove` events
    this.touches.push(move);
    this.next.x = this.current.x + this.delta.x;

    if (this.next.x > this.limit.left.x) { //left-most limit
      this.delta.bounce = Math.round((this.limit.left.x - this.next.x) / 2);
      this.next.x = this.limit.left.x - this.delta.bounce
    }
    else if (this.next.x < this.limit.right.x) {
      this.delta.bounce = Math.round((this.limit.right.x - this.next.x) / 2);
      this.next.x = this.limit.right.x - this.delta.bounce;
    }

    this.slider.css({
      transform: 'translate3d(' + this.next.x + 'px, 0, 0)'
    });
  },

  _end: function () {
    if (!this.initiated) return;
    this.initiated = false;

    var d = this.animationDuration,
      sample = { percentage: 0.25 };

    //uncomment below to generate touch events used for simulation in tests
    //console.log('_end, touches', JSON.stringify(this.touches));

    sample.size = Math.ceil(this.touches.length * sample.percentage);

    if (sample.size > 1) {
      sample.data = _.last(this.touches, sample.size);
      sample.first = _.first(sample.data);
      sample.last = _.last(sample.data);
      sample.distance = sample.last.x - sample.first.x;
      sample.direction = sample.distance > 0 ? 1 : -1;
      sample.time = (sample.last.timeStamp - sample.first.timeStamp) / 1000;
      sample.speed = Math.abs(sample.distance / sample.time);
      sample.velocity = Math.min(sample.speed, 1500) * sample.direction;

      sample.position = Math.ceil(sample.velocity * (d - d * d / (2 * d)));

      this.next.x += sample.position;
    }

    if (Math.abs(sample.velocity) > this.pageWidth * 6 ) { //significant momentum
      this.next.x = Math.round(this.next.x / this.pageWidth) * this.pageWidth;
    }

    this.current.x = this.next.x;
    this._enforceLimits();

    this.next.page = Math.floor(-this.current.x / this.pageWidth) + this.pages.side;
    this.touches = [];

    this.slider.off(transitionEndEvent)
    .one(transitionEndEvent, this._transitionEnd)
    .css({
      transform: 'translate3d(' + this.current.x + 'px, 0, 0)',
      transitionDuration: d + 's'
    });
    this.animating = true;
  },

  _transitionEnd: function () {
    this.animating = false;
    this.delta.page = Math.abs(this.next.page - this.current.page);
    for (var i=0; i < this.delta.page; i++) {
      if (this.next.page > this.current.page) {
        this.crossBoundary(this.current.page, this.current.page + 1);
      }
      else {
        this.crossBoundary(this.current.page, this.current.page - 1);
      }
    }
  },

  _cancel: function (evt) {
    this._end(evt);
  },

  _resize: function (evt) {
    this.container.width = this.$el.width();
    if (!this.loop) {
      this.limit.left.x = 0;
      this.limit.right.x = Math.min(this.data.length * -this.pageWidth + this.container.width, 0);
    }
    else {
      this.limit.left.x = Infinity;
      this.limit.right.x = -Infinity;
    }

    if (this._enforceLimits()) {
      this.slider.off(transitionEndEvent)
      .css({
        transform: 'translate3d(' + this.current.x + 'px, 0, 0)',
        transitionDuration: '0s'
      });
    }
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
