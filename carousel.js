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
  cancelEvent = hasTouch ? 'touchcancel' : 'mouseup',
  transitionEndEvent = 'webkitTransitionEnd transitionend';

// ---------------------------------------------------------------------------
// Carousel.js

function Carousel(options) {
  options || (options = {});

  this.container = {width: 0};
  this.current = {x: 0, page:0};
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
  'manageImages',
  'pageTemplate',
  'pageWidth',
  'snap',
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
      manageImages: false,
      pageWidth: 256,
      snap: false,
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
      '_resize',
      '_imagesLoaded'
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

    if (this.manageImages) {
      this.delayBuffers = true;
    }

    this.rendered = false;
  },

  _imagesLoaded: function (instance) {
    Carousel.prototype.visibleQueue = _.without(Carousel.prototype.visibleQueue, this);

    if (Carousel.prototype.visibleQueue.length === 0) {
      Carousel.prototype.flush();
    }
    this.trigger('imagesloaded', instance);
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
      var data = this.loop ? this.data[dataIndex] : {},
        x = (i - this.pages.side) * this.pageWidth;

      this.page[i] = {
        x: x,
        dataIndex: dataIndex,
        data: data,
        $el: $(this.pageTemplate()).css({
          position: 'absolute',
          left: x + 'px'
        })
      };

      dataIndex = (dataIndex - 1) % this.data.length;
    }

    dataIndex = 0;
    for (var i=this.current.page; i<this.page.length; i++) {
      var data,
        x = (i - this.pages.side) * this.pageWidth;

      if (!this.loop && (i - this.current.page) > (this.data.length - 1) ) {
        data = {};
      }
      else {
        data = this.data[dataIndex];
      }

      this.page[i] = {
        x: x,
        dataIndex: dataIndex,
        data: data,
        $el: $(this.pageTemplate()).css({
          position: 'absolute',
          left: x + 'px'
        })
      };

      dataIndex = (dataIndex + 1) % this.data.length;
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

  goToDataIndex: function (index) {
    if (index < 0 || index > (this.data.length - 1)) return;
    if (!this.rendered) this.renderBuffers();
    this.current.x = index * -this.pageWidth;
    this._enforceLimits();

    this.next.page = Math.floor(-this.current.x / this.pageWidth) + this.pages.side;

    this.slider.css({
      transform: 'translate3d(' + this.current.x + 'px, 0, 0)',
      transitionDuration: '0s'
    });
    this._transitionEnd();
  },

  visibleQueue: [],

  bufferQueue: [],

  flush: function () {
    _(Carousel.prototype.bufferQueue).each(function (carousel) {
      _.delay(function () {
        if (!carousel.rendered) carousel.renderBuffers.call(carousel);
      }, 0);
    });
    Carousel.prototype.bufferQueue = [];
    Carousel.prototype.visibleQueue = [];
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

    if (this.manageImages) {
      Carousel.prototype.visibleQueue.push(this);
      Carousel.prototype.bufferQueue.push(this);
      this.$el.imagesLoaded(this._imagesLoaded);
    }

    return this;
  },

  indexShift: function (current, amt, size) {
    return (size + ((current + amt) % size)) % size;
  },

  crossBoundary: function (previous, current) {
    var rightMostPage = _.max(this.page, function(page) { return page.x; }),
        leftMostPage  = _.min(this.page, function(page) { return page.x; }),
        previousData,
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

    previousData = currentData;
    leftMostPage = _.min(this.page, function(page) { return page.x; });
    currentData  = this.indexShift(leftMostPage.dataIndex, this.pages.side, this.data.length);

    this.trigger('crossboundary', {
      page: previous,
      dataIndex: previousData
    },{
      page: current,
      dataIndex: currentData
    });
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
    this.start.timeStamp = evt.originalEvent.timeStamp;
    this.initiated = true;

    this.touches = [this.start];
    this.steps = { x: 0, y: 0 };
    this.next.x = this.current.x;

    this.slider.css({
      transitionDuration: '0s'
    });
  },

  _move: function (evt) {
    if (!this.initiated) return;
    var point = hasTouch ? evt.originalEvent.touches[0] : evt.originalEvent,
      move = { x: point.pageX, y: point.pageY, timeStamp: evt.originalEvent.timeStamp },
      last = _(this.touches).last(),
      delta = { x: move.x- last.x, y: move.y - last.y };

    this.steps.x += Math.abs(delta.x);
    this.steps.y += Math.abs(delta.y);

    if (this.animating) this._transitionEnd(); //cleanup running animation

    //Wait for 10 pixel movement before beginning animations
    if (this.steps.x < 10 && this.steps.y < 10) {
      return;
    }

    //If overall movement is greater in y direction, end animations
    if (this.steps.y > this.steps.x) {
      this._end()
      return;
    }

    this.touches.push(move);
    evt.preventDefault(); // prevent vertical scrolling
    this.next.x += delta.x;

    //Check if we are at a limit, if so, only move by half of delta
    if (this.next.x > this.limit.left.x || this.next.x < this.limit.right.x) {
      this.next.x -= Math.round(delta.x / 2);
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

    if (this.snap || Math.abs(sample.velocity) > this.pageWidth * 6 ) { //significant momentum
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
    var delta = Math.abs(this.next.page - this.current.page);
    for (var i=0; i < delta; i++) {
      if (this.next.page > this.current.page) {
        this.crossBoundary(this.current.page, this.current.page + 1);
      }
      else {
        this.crossBoundary(this.current.page, this.current.page - 1);
      }
    }
    this.trigger('transitionend');
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
    this.trigger('resize', evt);
  }
});

// Events API
// ---------------
// A module that can be mixed in to *any object* in order to provide it with
// custom events. You may bind with `on` or remove with `off` callback
// functions to an event; `trigger`-ing an event fires all callbacks in
// succession.
//
//     var object = {};
//     _.extend(object, Carousel.Events);
//     object.on('expand', function(){ alert('expanded'); });
//     object.trigger('expand');
//
var array = [];
var push = array.push;
var slice = array.slice;
var Events = Carousel.Events = {

  // Bind an event to a `callback` function. Passing `"all"` will bind
  // the callback to all events fired.
  on: function(name, callback, context) {
    if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
    this._events || (this._events = {});
    var events = this._events[name] || (this._events[name] = []);
    events.push({callback: callback, context: context, ctx: context || this});
    return this;
  },

  // Bind an event to only be triggered a single time. After the first time
  // the callback is invoked, it will be removed.
  once: function(name, callback, context) {
    if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
    var self = this;
    var once = _.once(function() {
      self.off(name, once);
      callback.apply(this, arguments);
    });
    once._callback = callback;
    return this.on(name, once, context);
  },

  // Remove one or many callbacks. If `context` is null, removes all
  // callbacks with that function. If `callback` is null, removes all
  // callbacks for the event. If `name` is null, removes all bound
  // callbacks for all events.
  off: function(name, callback, context) {
    var retain, ev, events, names, i, l, j, k;
    if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
    if (!name && !callback && !context) {
      this._events = {};
      return this;
    }
    names = name ? [name] : _.keys(this._events);
    for (i = 0, l = names.length; i < l; i++) {
      name = names[i];
      if (events = this._events[name]) {
        this._events[name] = retain = [];
        if (callback || context) {
          for (j = 0, k = events.length; j < k; j++) {
            ev = events[j];
            if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                (context && context !== ev.context)) {
              retain.push(ev);
            }
          }
        }
        if (!retain.length) delete this._events[name];
      }
    }

    return this;
  },

  // Trigger one or many events, firing all bound callbacks. Callbacks are
  // passed the same arguments as `trigger` is, apart from the event name
  // (unless you're listening on `"all"`, which will cause your callback to
  // receive the true name of the event as the first argument).
  trigger: function(name) {
    if (!this._events) return this;
    var args = slice.call(arguments, 1);
    if (!eventsApi(this, 'trigger', name, args)) return this;
    var events = this._events[name];
    var allEvents = this._events.all;
    if (events) triggerEvents(events, args);
    if (allEvents) triggerEvents(allEvents, arguments);
    return this;
  },

  // Tell this object to stop listening to either specific events ... or
  // to every object it's currently listening to.
  stopListening: function(obj, name, callback) {
    var listeningTo = this._listeningTo;
    if (!listeningTo) return this;
    var remove = !name && !callback;
    if (!callback && typeof name === 'object') callback = this;
    if (obj) (listeningTo = {})[obj._listenId] = obj;
    for (var id in listeningTo) {
      obj = listeningTo[id];
      obj.off(name, callback, this);
      if (remove || _.isEmpty(obj._events)) delete this._listeningTo[id];
    }
    return this;
  }

};

// Regular expression used to split event strings.
var eventSplitter = /\s+/;

// Implement fancy features of the Events API such as multiple event
// names `"change blur"` and jQuery-style event maps `{change: action}`
// in terms of the existing API.
var eventsApi = function(obj, action, name, rest) {
  if (!name) return true;

  // Handle event maps.
  if (typeof name === 'object') {
    for (var key in name) {
      obj[action].apply(obj, [key, name[key]].concat(rest));
    }
    return false;
  }

  // Handle space separated event names.
  if (eventSplitter.test(name)) {
    var names = name.split(eventSplitter);
    for (var i = 0, l = names.length; i < l; i++) {
      obj[action].apply(obj, [names[i]].concat(rest));
    }
    return false;
  }

  return true;
};

// A difficult-to-believe, but optimized internal dispatch function for
// triggering events. Tries to keep the usual cases speedy
var triggerEvents = function(events, args) {
  var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
  switch (args.length) {
    case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
    case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
    case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
    case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
    default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
  }
};

var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

// Inversion-of-control versions of `on` and `once`. Tell *this* object to
// listen to an event in another object ... keeping track of what it's
// listening to.
_.each(listenMethods, function(implementation, method) {
  Events[method] = function(obj, name, callback) {
    var listeningTo = this._listeningTo || (this._listeningTo = {});
    var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
    listeningTo[id] = obj;
    if (!callback && typeof name === 'object') callback = this;
    obj[implementation](name, callback, this);
    return this;
  };
});
_.extend(Carousel.prototype, Events);

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
