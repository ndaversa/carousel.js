var expect = chai.expect;

function pick (obj, props) {
  var _props = _.clone(props),
    rc;

  if (_props.indexOf('transform') >= 0) {
    _props.push('webkitTransform');
  }

  rc = _.pick(obj, _props);
  if (rc.webkitTransform) {
    rc.transform = rc.webkitTransform;
    delete rc.webkitTransform;
  }

  return rc;
}

function makeTouchEvent (evt) {
  return {
    originalEvent: {
      timeStamp: evt.timeStamp,
      pageX: evt.x,
      pageY: evt.y,
      touches: [{
        pageX: evt.x,
        pageY: evt.y
      }]
    },
    preventDefault: function () {}
  };
}

function triggerTouches (obj, touches) {
  var start = touches.shift(),
    last;

  obj._start(makeTouchEvent(start));

  for (var i=0; i<touches.length; i++) {
    last = touches[i];
    obj._move(makeTouchEvent(last));
  }

  obj._end(makeTouchEvent(last));
  obj.slider.trigger('transitionend');
}

function triggerResize (carousel, width) {
  carousel.$el.width(width);
  carousel._resize();
}

describe('Carousel', function () {
  var one = [
      { content: '0' },
    ],
    two = [
      { content: '0' },
      { content: '1' },
    ],
    four = [
      { content: '0' },
      { content: '1' },
      { content: '2' },
      { content: '3' },
    ],
    five = [
      { content: '0' },
      { content: '1' },
      { content: '2' },
      { content: '3' },
      { content: '4' },
    ],
    six = [
      { content: '0' },
      { content: '1' },
      { content: '2' },
      { content: '3' },
      { content: '4' },
      { content: '5' },
    ],
    eleven = [
      { content: '0' },
      { content: '1' },
      { content: '2' },
      { content: '3' },
      { content: '4' },
      { content: '5' },
      { content: '6' },
      { content: '7' },
      { content: '8' },
      { content: '9' },
      { content: '10' },
    ],
    fiveImages1 = [
      { url: 'http://placehold.it/128x200/D5FBFF' },
      { url: 'http://placehold.it/128x200/9FBCBF' },
      { url: 'http://placehold.it/128x200/647678' },
      { url: 'http://placehold.it/128x200/2F3738' },
      { url: 'http://placehold.it/128x200/59D8E6' },
    ],
    fiveImages2 = [
      { url: 'http://placehold.it/128x200/85DB18' },
      { url: 'http://placehold.it/128x200/CDE855' },
      { url: 'http://placehold.it/128x200/F5F6D4' },
      { url: 'http://placehold.it/128x200/A7C520' },
      { url: 'http://placehold.it/128x200/493F0B' },
    ],
    fiveImages3 = [
      { url: 'http://placehold.it/128x200/DC3522' },
      { url: 'http://placehold.it/128x200/D9CB9E' },
      { url: 'http://placehold.it/128x200/374140' },
      { url: 'http://placehold.it/128x200/2A2C2B' },
      { url: 'http://placehold.it/128x200/1E1E20' },
    ],
    elevenImages = [
      { url: 'http://placehold.it/128x200/D5FBFF' },
      { url: 'http://placehold.it/128x200/9FBCBF' },
      { url: 'http://placehold.it/128x200/647678' },
      { url: 'http://placehold.it/128x200/2F3738' },
      { url: 'http://placehold.it/128x200/59D8E6' },
      { url: 'http://placehold.it/128x200/D6FBFF' },
      { url: 'http://placehold.it/128x200/FFBCBF' },
      { url: 'http://placehold.it/128x200/747678' },
      { url: 'http://placehold.it/128x200/3F3738' },
      { url: 'http://placehold.it/128x200/69D8E6' },
      { url: 'http://placehold.it/128x200/79D8E6' },
    ],
    carousel,
    el;

  it('can be instantiated', function () {
    var carousel = new Carousel();
    expect(carousel).to.not.be.undefined;
  });

  describe('options', function () {
    it('has the correct default values', function () {
      var carousel = new Carousel();
      var carouselOptions = [
        'loop',
        'animationDuration'
      ];
      var pickedOptions = _.pick(carousel, carouselOptions);

      expect(pickedOptions).to.deep.equal({
        loop: true,
        animationDuration: 0.325
      });
    });

    it('allows defaults to be overridden', function () {
      var carousel = new Carousel({
        loop: false,
        animationDuration: 0.4
      });
      var carouselOptions = ['loop', 'animationDuration'];
      var pickedOptions = _.pick(carousel, carouselOptions);

      expect(pickedOptions).to.deep.equal({
        loop: false,
        animationDuration: 0.4
      });
    });

    it('accepts an element as an option', function () {
      $('<div id="test" />').appendTo('body');
      var carousel = new Carousel({
        el: $('#test')[0]
      });

      expect(carousel.el.id).to.equal('test');
      $('#test').remove();
    });

    it('accepts a selector as an option', function () {
      $('<div id="test" />').appendTo('body');
      var carousel = new Carousel({
        el: '#test'
      });

      expect(carousel.el.id).to.equal('test');
      $('#test').remove();
    });

    it('accepts an initial offset value', function () {
      $('<div id="test" />').appendTo('body');
      var carousel = new Carousel({
        el: '#test',
        initialOffset: 25,
      });

      $('#test').remove();
      expect(carousel.current.x).to.equal(25);
    });
  });

  describe('render', function () {
    var el, carousel;

    beforeEach(function () {
      el = $('<div id="test" />');
      el.appendTo('body');
      carousel = new Carousel({
        el: '#test'
      });
    });

    afterEach(function () {
      el.remove();
    });

    it('returns the instance of the object', function () {
      expect(carousel.render()).to.equal(carousel);
    });

    it('correctly renders after instantiation', function () {
      var parentProps = ['overflow', 'position'],
        sliderProps = ['top', 'height', 'width', 'transitionDuration', 'transitionTimingFunction', 'transform'],
        styles;

      carousel.render();

      styles = pick(carousel.el.style, parentProps);
      expect(styles).to.deep.equal({
        overflow: 'hidden',
        position: 'relative'
      });

      styles = pick(carousel.$el.children().first()[0].style, sliderProps);
      expect(styles).to.deep.equal({
        top: '0px',
        height: '100%',
        width: '100%',
        transitionDuration: '0s',
        transitionTimingFunction: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
        transform: 'translate3d(0px, 0px, 0px)'
      });
    });
  });

  describe('initial layout', function () {
    var el, carousel;

    beforeEach(function () {
      el = $('<div id="test" style="width: 320px;" />');
      el.appendTo('body');
      carousel = new Carousel({
        el: '#test'
      });
    });

    afterEach(function () {
      el.remove();
    });

    describe('with looping', function () {

      it('layouts out correctly with default options', function () {
        var carousel = new Carousel({
          el: '#test',
          data: eleven
        });
        carousel.render();
        expect(carousel.current.page).to.equal(2);
        expect(carousel.page.length).to.equal(6);

        expect(carousel.page[0].data).to.deep.equal({ content: '9' });
        expect(carousel.page[1].data).to.deep.equal({ content: '10' });
        expect(carousel.page[2].data).to.deep.equal({ content: '0' });
        expect(carousel.page[3].data).to.deep.equal({ content: '1' });
        expect(carousel.page[4].data).to.deep.equal({ content: '2' });
        expect(carousel.page[5].data).to.deep.equal({ content: '3' });

        expect(carousel.page[0].x).to.equal(-512);
        expect(carousel.page[1].x).to.equal(-256);
        expect(carousel.page[2].x).to.equal(0);
        expect(carousel.page[3].x).to.equal(256);
        expect(carousel.page[4].x).to.equal(512);
        expect(carousel.page[5].x).to.equal(768);
      });

      it('handles data.length < page.length', function () {
        var carousel = new Carousel({
          el: '#test',
          data: two
        });
        carousel.render();
        expect(carousel.current.page).to.equal(2);
        expect(carousel.page.length).to.equal(6);
        expect(carousel.page[0].data).to.deep.equal({ content: '0' });
        expect(carousel.page[1].data).to.deep.equal({ content: '1' });
        expect(carousel.page[2].data).to.deep.equal({ content: '0' });
        expect(carousel.page[3].data).to.deep.equal({ content: '1' });
        expect(carousel.page[4].data).to.deep.equal({ content: '0' });
        expect(carousel.page[5].data).to.deep.equal({ content: '1' });

        expect(carousel.page[0].x).to.equal(-512);
        expect(carousel.page[1].x).to.equal(-256);
        expect(carousel.page[2].x).to.equal(0);
        expect(carousel.page[3].x).to.equal(256);
        expect(carousel.page[4].x).to.equal(512);
        expect(carousel.page[5].x).to.equal(768);
      });

      it('handles data.length one less then page.length', function () {
        var carousel = new Carousel({
          el: '#test',
          data: five
        });
        carousel.render();
        expect(carousel.current.page).to.equal(2);
        expect(carousel.page[0].data).to.deep.equal({ content: '3' });
        expect(carousel.page[1].data).to.deep.equal({ content: '4' });
        expect(carousel.page[2].data).to.deep.equal({ content: '0' });
        expect(carousel.page[3].data).to.deep.equal({ content: '1' });
        expect(carousel.page[4].data).to.deep.equal({ content: '2' });
        expect(carousel.page[5].data).to.deep.equal({ content: '3' });

        expect(carousel.page[0].x).to.equal(-512);
        expect(carousel.page[1].x).to.equal(-256);
        expect(carousel.page[2].x).to.equal(0);
        expect(carousel.page[3].x).to.equal(256);
        expect(carousel.page[4].x).to.equal(512);
        expect(carousel.page[5].x).to.equal(768);
      });

      it('handles data.length = 1', function () {
        var carousel = new Carousel({
          el: '#test',
          data: one
        });
        carousel.render();
        expect(carousel.current.page).to.equal(2);
        expect(carousel.page[0].data).to.deep.equal({ content: '0' });
        expect(carousel.page[1].data).to.deep.equal({ content: '0' });
        expect(carousel.page[2].data).to.deep.equal({ content: '0' });
        expect(carousel.page[3].data).to.deep.equal({ content: '0' });
        expect(carousel.page[4].data).to.deep.equal({ content: '0' });
        expect(carousel.page[5].data).to.deep.equal({ content: '0' });

        expect(carousel.page[0].x).to.equal(-512);
        expect(carousel.page[1].x).to.equal(-256);
        expect(carousel.page[2].x).to.equal(0);
        expect(carousel.page[3].x).to.equal(256);
        expect(carousel.page[4].x).to.equal(512);
        expect(carousel.page[5].x).to.equal(768);
      });
    });

    describe('without looping', function () {

      it('lays out correctly with data.length > page.length', function () {
        var carousel = new Carousel({
          el: '#test',
          loop: false,
          data: eleven
        });
        carousel.render();
        expect(carousel.current.page).to.equal(2);
        expect(carousel.page.length).to.equal(6);

        expect(carousel.page[0].data).to.deep.equal({ content: '' });
        expect(carousel.page[1].data).to.deep.equal({ content: '' });
        expect(carousel.page[2].data).to.deep.equal({ content: '0' });
        expect(carousel.page[3].data).to.deep.equal({ content: '1' });
        expect(carousel.page[4].data).to.deep.equal({ content: '2' });
        expect(carousel.page[5].data).to.deep.equal({ content: '3' });

        expect(carousel.page[0].x).to.equal(-512);
        expect(carousel.page[1].x).to.equal(-256);
        expect(carousel.page[2].x).to.equal(0);
        expect(carousel.page[3].x).to.equal(256);
        expect(carousel.page[4].x).to.equal(512);
        expect(carousel.page[5].x).to.equal(768);
      });

      it('handles data.length < page.length', function () {
        var carousel = new Carousel({
          el: '#test',
          loop: false,
          data: two
        });
        carousel.render();
        expect(carousel.current.page).to.equal(2);
        expect(carousel.page.length).to.equal(6);
        expect(carousel.page[0].data).to.deep.equal({ content: '' });
        expect(carousel.page[1].data).to.deep.equal({ content: '' });
        expect(carousel.page[2].data).to.deep.equal({ content: '0' });
        expect(carousel.page[3].data).to.deep.equal({ content: '1' });
        expect(carousel.page[4].data).to.deep.equal({ content: '' });
        expect(carousel.page[5].data).to.deep.equal({ content: '' });

        expect(carousel.page[0].x).to.equal(-512);
        expect(carousel.page[1].x).to.equal(-256);
        expect(carousel.page[2].x).to.equal(0);
        expect(carousel.page[3].x).to.equal(256);
        expect(carousel.page[4].x).to.equal(512);
        expect(carousel.page[5].x).to.equal(768);
      });

      it('handles data.length one less then page.length', function () {
        var carousel = new Carousel({
          el: '#test',
          loop: false,
          data: five
        });
        carousel.render();
        expect(carousel.current.page).to.equal(2);
        expect(carousel.page.length).to.equal(6);

        expect(carousel.page[0].data).to.deep.equal({ content: '' });
        expect(carousel.page[1].data).to.deep.equal({ content: '' });
        expect(carousel.page[2].data).to.deep.equal({ content: '0' });
        expect(carousel.page[3].data).to.deep.equal({ content: '1' });
        expect(carousel.page[4].data).to.deep.equal({ content: '2' });
        expect(carousel.page[5].data).to.deep.equal({ content: '3' });

        expect(carousel.page[0].x).to.equal(-512);
        expect(carousel.page[1].x).to.equal(-256);
        expect(carousel.page[2].x).to.equal(0);
        expect(carousel.page[3].x).to.equal(256);
        expect(carousel.page[4].x).to.equal(512);
        expect(carousel.page[5].x).to.equal(768);
      });

      it('handles data.length = 1', function () {
        var carousel = new Carousel({
          el: '#test',
          loop: false,
          data: one
        });
        carousel.render();
        expect(carousel.current.page).to.equal(2);
        expect(carousel.page.length).to.equal(6);

        expect(carousel.page[0].data).to.deep.equal({ content: '' });
        expect(carousel.page[1].data).to.deep.equal({ content: '' });
        expect(carousel.page[2].data).to.deep.equal({ content: '0' });
        expect(carousel.page[3].data).to.deep.equal({ content: '' });
        expect(carousel.page[4].data).to.deep.equal({ content: '' });
        expect(carousel.page[5].data).to.deep.equal({ content: '' });

        expect(carousel.page[0].x).to.equal(-512);
        expect(carousel.page[1].x).to.equal(-256);
        expect(carousel.page[2].x).to.equal(0);
        expect(carousel.page[3].x).to.equal(256);
        expect(carousel.page[4].x).to.equal(512);
        expect(carousel.page[5].x).to.equal(768);
      });
    });
  }); //describe initial layout

  describe('page management', function () {
    var el, carousel;
    describe('when looping', function () {

      beforeEach(function () {
        el = $('<div id="test" style="width: 320px;" />');
        el.appendTo('body');
        carousel = new Carousel({
          el: '#test',
          data: eleven
        });
        carousel.render();
      });

      afterEach(function () {
        el.remove();
      });

      describe('when swiping to the left (show more on the right)', function () {
        it('only advances the current page when crossing a page boundary', function () {
          sinon.spy(carousel, "crossBoundary");
          triggerTouches(carousel, [{"x":289,"page":0,"y":228,"timeStamp":1383944901440},{"x":289,"page":0,"y":228,"timeStamp":1383944901544},{"x":288,"page":0,"y":228,"timeStamp":1383944901562},{"x":286,"page":0,"y":228,"timeStamp":1383944901582},{"x":284,"page":0,"y":228,"timeStamp":1383944901595},{"x":281,"page":0,"y":228,"timeStamp":1383944901612},{"x":279,"page":0,"y":228,"timeStamp":1383944901630},{"x":277,"page":0,"y":228,"timeStamp":1383944901647},{"x":275,"page":0,"y":228,"timeStamp":1383944901664},{"x":273,"page":0,"y":228,"timeStamp":1383944901681},{"x":272,"page":0,"y":228,"timeStamp":1383944901698},{"x":272,"page":0,"y":228,"timeStamp":1383944901715},{"x":271,"page":0,"y":228,"timeStamp":1383944901732},{"x":271,"page":0,"y":228,"timeStamp":1383944901762},{"x":270,"page":0,"y":228,"timeStamp":1383944901850},{"x":270,"page":0,"y":228,"timeStamp":1383944901874}]);
          expect(carousel.crossBoundary).to.not.to.been.called;
          expect(carousel.current.page).to.equal(2);
        });

        it('advances to the next page when crossing a single page boundary', function () {
          sinon.spy(carousel, "crossBoundary");
          triggerTouches(carousel, [{"x":300,"page":0,"y":157,"timeStamp":1383919691109},{"x":300,"page":0,"y":157,"timeStamp":1383919691209},{"x":293,"page":0,"y":157,"timeStamp":1383919691226},{"x":275,"page":0,"y":156,"timeStamp":1383919691244},{"x":250,"page":0,"y":153,"timeStamp":1383919691267},{"x":216,"page":0,"y":150,"timeStamp":1383919691281},{"x":178,"page":0,"y":147,"timeStamp":1383919691298},{"x":137,"page":0,"y":143,"timeStamp":1383919691316},{"x":94,"page":0,"y":138,"timeStamp":1383919691332},{"x":66,"page":0,"y":135,"timeStamp":1383919691347},{"x":37,"page":0,"y":131,"timeStamp":1383919691364},{"x":13,"page":0,"y":126,"timeStamp":1383919691383},{"x":3,"page":0,"y":124,"timeStamp":1383919691398},{"x":-3,"page":0,"y":122,"timeStamp":1383919691417},{"x":-8,"page":0,"y":121,"timeStamp":1383919691433},{"x":-9,"page":0,"y":121,"timeStamp":1383919691450},{"x":-10,"page":0,"y":121,"timeStamp":1383919691467}]);

          expect(carousel.crossBoundary).to.have.been.calledOnce;
          expect(carousel.current.page).to.equal(3);

          expect(carousel.page[1].data).to.deep.equal({ content: '10' });
          expect(carousel.page[2].data).to.deep.equal({ content: '0' });
          expect(carousel.page[3].data).to.deep.equal({ content: '1' });
          expect(carousel.page[4].data).to.deep.equal({ content: '2' });
          expect(carousel.page[5].data).to.deep.equal({ content: '3' });
          expect(carousel.page[0].data).to.deep.equal({ content: '4' });

          expect(carousel.page[1].dataIndex).to.equal(10);
          expect(carousel.page[2].dataIndex).to.equal(0);
          expect(carousel.page[3].dataIndex).to.equal(1);
          expect(carousel.page[4].dataIndex).to.equal(2);
          expect(carousel.page[5].dataIndex).to.equal(3);
          expect(carousel.page[0].dataIndex).to.equal(4);

          expect(carousel.page[1].x).to.equal(-256);
          expect(carousel.page[2].x).to.equal(0);
          expect(carousel.page[3].x).to.equal(256);
          expect(carousel.page[4].x).to.equal(512);
          expect(carousel.page[5].x).to.equal(768);
          expect(carousel.page[0].x).to.equal(1024);
        });
      });

      describe('when swiping to the right (show more on the left)', function () {
        it('only advances the current page when crossing a page boundary', function () {
          sinon.spy(carousel, "crossBoundary");
          triggerTouches(carousel, [{"x":97,"page":0,"y":157,"timeStamp":1383919824416},{"x":101,"page":0,"y":157,"timeStamp":1383919824565},{"x":107,"page":0,"y":157,"timeStamp":1383919824581},{"x":115,"page":0,"y":157,"timeStamp":1383919824600},{"x":125,"page":0,"y":157,"timeStamp":1383919824618},{"x":133,"page":0,"y":157,"timeStamp":1383919824634},{"x":138,"page":0,"y":157,"timeStamp":1383919824650},{"x":142,"page":0,"y":157,"timeStamp":1383919824667},{"x":143,"page":0,"y":157,"timeStamp":1383919824683},{"x":144,"page":0,"y":157,"timeStamp":1383919824700}]);
          expect(carousel.crossBoundary).to.have.been.calledOnce;
          expect(carousel.current.page).to.equal(1);

          triggerTouches(carousel, [{"x":117,"page":0,"y":157,"timeStamp":1383919825518},{"x":118,"page":0,"y":157,"timeStamp":1383919825519},{"x":122,"page":0,"y":157,"timeStamp":1383919825535},{"x":126,"page":0,"y":157,"timeStamp":1383919825552},{"x":132,"page":0,"y":157,"timeStamp":1383919825569},{"x":139,"page":0,"y":157,"timeStamp":1383919825586},{"x":145,"page":0,"y":157,"timeStamp":1383919825604},{"x":150,"page":0,"y":157,"timeStamp":1383919825621},{"x":154,"page":0,"y":157,"timeStamp":1383919825638},{"x":158,"page":0,"y":157,"timeStamp":1383919825656},{"x":160,"page":0,"y":157,"timeStamp":1383919825673},{"x":161,"page":0,"y":157,"timeStamp":1383919825691},{"x":161,"page":0,"y":157,"timeStamp":1383919825708}]);
          expect(carousel.crossBoundary).to.have.been.calledOnce;
          expect(carousel.current.page).to.equal(1);

          expect(carousel.page[5].data).to.deep.equal({ content: '8' });
          expect(carousel.page[0].data).to.deep.equal({ content: '9' });
          expect(carousel.page[1].data).to.deep.equal({ content: '10' });
          expect(carousel.page[2].data).to.deep.equal({ content: '0' });
          expect(carousel.page[3].data).to.deep.equal({ content: '1' });
          expect(carousel.page[4].data).to.deep.equal({ content: '2' });

          expect(carousel.page[5].dataIndex).to.equal(8);
          expect(carousel.page[0].dataIndex).to.equal(9);
          expect(carousel.page[1].dataIndex).to.equal(10);
          expect(carousel.page[2].dataIndex).to.equal(0);
          expect(carousel.page[3].dataIndex).to.equal(1);
          expect(carousel.page[4].dataIndex).to.equal(2);

          expect(carousel.page[5].x).to.equal(-768);
          expect(carousel.page[0].x).to.equal(-512);
          expect(carousel.page[1].x).to.equal(-256);
          expect(carousel.page[2].x).to.equal(0);
          expect(carousel.page[3].x).to.equal(256);
          expect(carousel.page[4].x).to.equal(512);
        });

      });
    });
    describe('when not looping', function () {
      describe('when swiping to the left (show more on the right)', function () {

        beforeEach(function () {
          el = $('<div id="test" style="width: 320px;" />');
          el.appendTo('body');
          carousel = new Carousel({
            el: '#test',
            loop: false,
            data: two
          });
          carousel.render();
        });

        afterEach(function () {
          el.remove();
        });

        it('does not load data after the largest index (prevents wrapping)', function () {
          sinon.spy(carousel, "crossBoundary");
          triggerTouches(carousel, [{"x":299,"page":0,"y":203,"timeStamp":1383919928227},{"x":298,"page":0,"y":203,"timeStamp":1383919928313},{"x":287,"page":0,"y":203,"timeStamp":1383919928329},{"x":265,"page":0,"y":196,"timeStamp":1383919928349},{"x":224,"page":0,"y":178,"timeStamp":1383919928364},{"x":174,"page":0,"y":154,"timeStamp":1383919928382},{"x":141,"page":0,"y":141,"timeStamp":1383919928398},{"x":103,"page":0,"y":125,"timeStamp":1383919928415},{"x":66,"page":0,"y":112,"timeStamp":1383919928432},{"x":42,"page":0,"y":104,"timeStamp":1383919928449},{"x":15,"page":0,"y":95,"timeStamp":1383919928465},{"x":1,"page":0,"y":92,"timeStamp":1383919928482},{"x":-10,"page":0,"y":89,"timeStamp":1383919928503},{"x":-17,"page":0,"y":88,"timeStamp":1383919928518},{"x":-22,"page":0,"y":87,"timeStamp":1383919928535},{"x":-24,"page":0,"y":87,"timeStamp":1383919928552},{"x":-26,"page":0,"y":87,"timeStamp":1383919928569},{"x":-27,"page":0,"y":87,"timeStamp":1383919928586},{"x":-27,"page":0,"y":87,"timeStamp":1383919928604}]);
          expect(carousel.current.page).to.equal(2);

          expect(carousel.page[0].data).to.deep.equal({ content: '' });
          expect(carousel.page[1].data).to.deep.equal({ content: '' });
          expect(carousel.page[2].data).to.deep.equal({ content: '0' });
          expect(carousel.page[3].data).to.deep.equal({ content: '1' });
          expect(carousel.page[4].data).to.deep.equal({ content: '' });
          expect(carousel.page[5].data).to.deep.equal({ content: '' });

          expect(carousel.page[0].x).to.equal(-512);
          expect(carousel.page[1].x).to.equal(-256);
          expect(carousel.page[2].x).to.equal(0);
          expect(carousel.page[3].x).to.equal(256);
          expect(carousel.page[4].x).to.equal(512);
          expect(carousel.page[5].x).to.equal(768);
        });
      });
      describe('when swiping to the right (show more on the left)', function () {

        beforeEach(function () {
          el = $('<div id="test" style="width: 320px;" />');
          el.appendTo('body');
          carousel = new Carousel({
            el: '#test',
            loop: false,
            data: six
          });
          carousel.render();
        });

        afterEach(function () {
          el.remove();
        });

        it('has the correct state at the right bound when data.length > page.length', function () {
          sinon.spy(carousel, "crossBoundary");
          triggerTouches(carousel, [{"x":303,"page":0,"y":219,"timeStamp":1383919977869},{"x":302,"page":0,"y":219,"timeStamp":1383919977970},{"x":297,"page":0,"y":219,"timeStamp":1383919977987},{"x":288,"page":0,"y":219,"timeStamp":1383919978007},{"x":268,"page":0,"y":219,"timeStamp":1383919978026},{"x":245,"page":0,"y":219,"timeStamp":1383919978039},{"x":218,"page":0,"y":215,"timeStamp":1383919978056},{"x":190,"page":0,"y":212,"timeStamp":1383919978073},{"x":166,"page":0,"y":208,"timeStamp":1383919978090},{"x":138,"page":0,"y":205,"timeStamp":1383919978108},{"x":121,"page":0,"y":201,"timeStamp":1383919978125},{"x":103,"page":0,"y":198,"timeStamp":1383919978143},{"x":92,"page":0,"y":196,"timeStamp":1383919978160},{"x":82,"page":0,"y":195,"timeStamp":1383919978177},{"x":73,"page":0,"y":194,"timeStamp":1383919978195},{"x":64,"page":0,"y":194,"timeStamp":1383919978211},{"x":58,"page":0,"y":194,"timeStamp":1383919978228},{"x":54,"page":0,"y":194,"timeStamp":1383919978245},{"x":51,"page":0,"y":194,"timeStamp":1383919978262},{"x":48,"page":0,"y":193,"timeStamp":1383919978279},{"x":46,"page":0,"y":193,"timeStamp":1383919978300},{"x":43,"page":0,"y":193,"timeStamp":1383919978314},{"x":41,"page":0,"y":193,"timeStamp":1383919978331},{"x":38,"page":0,"y":193,"timeStamp":1383919978348},{"x":38,"page":0,"y":192,"timeStamp":1383919978365},{"x":37,"page":0,"y":192,"timeStamp":1383919978383},{"x":36,"page":0,"y":191,"timeStamp":1383919978399},{"x":36,"page":0,"y":191,"timeStamp":1383919978424},{"x":35,"page":0,"y":191,"timeStamp":1383919978440},{"x":34,"page":0,"y":191,"timeStamp":1383919978461},{"x":34,"page":0,"y":191,"timeStamp":1383919978478},{"x":34,"page":0,"y":191,"timeStamp":1383919978496},{"x":34,"page":0,"y":190,"timeStamp":1383919978518}]);
          triggerTouches(carousel, [{"x":303,"page":0,"y":224,"timeStamp":1383919980850},{"x":302,"page":0,"y":224,"timeStamp":1383919980914},{"x":298,"page":0,"y":224,"timeStamp":1383919980931},{"x":290,"page":0,"y":224,"timeStamp":1383919980948},{"x":279,"page":0,"y":223,"timeStamp":1383919980965},{"x":260,"page":0,"y":217,"timeStamp":1383919980982},{"x":239,"page":0,"y":211,"timeStamp":1383919981000},{"x":216,"page":0,"y":204,"timeStamp":1383919981016},{"x":187,"page":0,"y":194,"timeStamp":1383919981033},{"x":167,"page":0,"y":187,"timeStamp":1383919981050},{"x":145,"page":0,"y":180,"timeStamp":1383919981067},{"x":131,"page":0,"y":176,"timeStamp":1383919981084},{"x":111,"page":0,"y":173,"timeStamp":1383919981101},{"x":99,"page":0,"y":170,"timeStamp":1383919981118},{"x":88,"page":0,"y":168,"timeStamp":1383919981135},{"x":82,"page":0,"y":166,"timeStamp":1383919981152},{"x":73,"page":0,"y":163,"timeStamp":1383919981172},{"x":66,"page":0,"y":162,"timeStamp":1383919981188},{"x":59,"page":0,"y":161,"timeStamp":1383919981203},{"x":52,"page":0,"y":159,"timeStamp":1383919981222},{"x":48,"page":0,"y":159,"timeStamp":1383919981239},{"x":42,"page":0,"y":157,"timeStamp":1383919981255},{"x":38,"page":0,"y":157,"timeStamp":1383919981271},{"x":36,"page":0,"y":157,"timeStamp":1383919981289},{"x":35,"page":0,"y":156,"timeStamp":1383919981306},{"x":34,"page":0,"y":156,"timeStamp":1383919981323},{"x":34,"page":0,"y":156,"timeStamp":1383919981368},{"x":34,"page":0,"y":156,"timeStamp":1383919981389},{"x":33,"page":0,"y":156,"timeStamp":1383919981406},{"x":33,"page":0,"y":155,"timeStamp":1383919981484}]);
          triggerTouches(carousel, [{"x":300,"page":0,"y":210,"timeStamp":1383919982720},{"x":299,"page":0,"y":210,"timeStamp":1383919982790},{"x":295,"page":0,"y":210,"timeStamp":1383919982807},{"x":286,"page":0,"y":210,"timeStamp":1383919982824},{"x":274,"page":0,"y":210,"timeStamp":1383919982841},{"x":248,"page":0,"y":204,"timeStamp":1383919982858},{"x":205,"page":0,"y":193,"timeStamp":1383919982875},{"x":149,"page":0,"y":176,"timeStamp":1383919982893},{"x":93,"page":0,"y":160,"timeStamp":1383919982910},{"x":73,"page":0,"y":154,"timeStamp":1383919982927},{"x":52,"page":0,"y":148,"timeStamp":1383919982944},{"x":33,"page":0,"y":144,"timeStamp":1383919982961},{"x":20,"page":0,"y":141,"timeStamp":1383919982978},{"x":11,"page":0,"y":139,"timeStamp":1383919982995},{"x":1,"page":0,"y":138,"timeStamp":1383919983012},{"x":-6,"page":0,"y":137,"timeStamp":1383919983035},{"x":-11,"page":0,"y":136,"timeStamp":1383919983047},{"x":-16,"page":0,"y":136,"timeStamp":1383919983065},{"x":-19,"page":0,"y":135,"timeStamp":1383919983081},{"x":-20,"page":0,"y":135,"timeStamp":1383919983098},{"x":-21,"page":0,"y":135,"timeStamp":1383919983117}]);
          triggerTouches(carousel, [{"x":293,"page":0,"y":220,"timeStamp":1383919984632},{"x":292,"page":0,"y":220,"timeStamp":1383919984725},{"x":287,"page":0,"y":220,"timeStamp":1383919984742},{"x":277,"page":0,"y":220,"timeStamp":1383919984759},{"x":254,"page":0,"y":220,"timeStamp":1383919984777},{"x":234,"page":0,"y":220,"timeStamp":1383919984793},{"x":206,"page":0,"y":220,"timeStamp":1383919984811},{"x":182,"page":0,"y":220,"timeStamp":1383919984828},{"x":163,"page":0,"y":219,"timeStamp":1383919984845},{"x":152,"page":0,"y":218,"timeStamp":1383919984862},{"x":133,"page":0,"y":216,"timeStamp":1383919984880},{"x":124,"page":0,"y":214,"timeStamp":1383919984897},{"x":111,"page":0,"y":214,"timeStamp":1383919984914},{"x":103,"page":0,"y":213,"timeStamp":1383919984931},{"x":96,"page":0,"y":212,"timeStamp":1383919984949},{"x":89,"page":0,"y":212,"timeStamp":1383919984965},{"x":83,"page":0,"y":212,"timeStamp":1383919984982},{"x":79,"page":0,"y":212,"timeStamp":1383919984999},{"x":74,"page":0,"y":212,"timeStamp":1383919985016},{"x":71,"page":0,"y":212,"timeStamp":1383919985033},{"x":68,"page":0,"y":212,"timeStamp":1383919985050},{"x":66,"page":0,"y":212,"timeStamp":1383919985067},{"x":64,"page":0,"y":212,"timeStamp":1383919985084},{"x":63,"page":0,"y":212,"timeStamp":1383919985101},{"x":62,"page":0,"y":212,"timeStamp":1383919985123}]);
          triggerTouches(carousel, [{"x":304,"page":0,"y":203,"timeStamp":1383919986444},{"x":303,"page":0,"y":203,"timeStamp":1383919986554},{"x":298,"page":0,"y":203,"timeStamp":1383919986572},{"x":289,"page":0,"y":203,"timeStamp":1383919986589},{"x":276,"page":0,"y":203,"timeStamp":1383919986605},{"x":258,"page":0,"y":203,"timeStamp":1383919986623},{"x":235,"page":0,"y":203,"timeStamp":1383919986640},{"x":205,"page":0,"y":198,"timeStamp":1383919986656},{"x":186,"page":0,"y":193,"timeStamp":1383919986673},{"x":164,"page":0,"y":187,"timeStamp":1383919986690},{"x":147,"page":0,"y":184,"timeStamp":1383919986706},{"x":131,"page":0,"y":180,"timeStamp":1383919986724},{"x":114,"page":0,"y":176,"timeStamp":1383919986741},{"x":101,"page":0,"y":174,"timeStamp":1383919986759},{"x":90,"page":0,"y":171,"timeStamp":1383919986775},{"x":82,"page":0,"y":170,"timeStamp":1383919986793},{"x":74,"page":0,"y":169,"timeStamp":1383919986810},{"x":67,"page":0,"y":168,"timeStamp":1383919986827},{"x":61,"page":0,"y":168,"timeStamp":1383919986845},{"x":57,"page":0,"y":168,"timeStamp":1383919986862},{"x":51,"page":0,"y":168,"timeStamp":1383919986879},{"x":48,"page":0,"y":167,"timeStamp":1383919986897},{"x":47,"page":0,"y":167,"timeStamp":1383919986913},{"x":46,"page":0,"y":167,"timeStamp":1383919986937}]);
          expect(carousel.crossBoundary.callCount).to.equal(4);
          expect(carousel.current.page).to.equal(6);

          expect(carousel.page[0].data).to.deep.equal({ content: '4' });
          expect(carousel.page[1].data).to.deep.equal({ content: '5' });
          expect(carousel.page[2].data).to.deep.equal({ content: '' });
          expect(carousel.page[3].data).to.deep.equal({ content: '' });
          expect(carousel.page[4].data).to.deep.equal({ content: '2' });
          expect(carousel.page[5].data).to.deep.equal({ content: '3' });

          expect(carousel.page[4].x).to.equal(512);
          expect(carousel.page[5].x).to.equal(768);
          expect(carousel.page[0].x).to.equal(1024);
          expect(carousel.page[1].x).to.equal(1280);
          expect(carousel.page[2].x).to.equal(1536);
          expect(carousel.page[3].x).to.equal(1792);
        });
      });
    });

    describe('when pageWidth is not the default size', function () {
        beforeEach(function () {
          el = $('<div id="test" style="width: 320px;" />');
          el.appendTo('body');
          carousel = new Carousel({
            el: '#test',
            pageWidth: 128,
            data: eleven
          });
          carousel.render();
        });

        afterEach(function () {
          el.remove();
        });

        it('has the correct initial layout', function () {
          expect(carousel.current.page).to.equal(3);
          expect(carousel.page.length).to.equal(9);

          expect(carousel.page[0].data).to.deep.equal({ content: '8' });
          expect(carousel.page[1].data).to.deep.equal({ content: '9' });
          expect(carousel.page[2].data).to.deep.equal({ content: '10' });
          expect(carousel.page[3].data).to.deep.equal({ content: '0' });
          expect(carousel.page[4].data).to.deep.equal({ content: '1' });
          expect(carousel.page[5].data).to.deep.equal({ content: '2' });
          expect(carousel.page[6].data).to.deep.equal({ content: '3' });
          expect(carousel.page[7].data).to.deep.equal({ content: '4' });
          expect(carousel.page[8].data).to.deep.equal({ content: '5' });

          expect(carousel.page[0].x).to.equal(-384);
          expect(carousel.page[1].x).to.equal(-256);
          expect(carousel.page[2].x).to.equal(-128);
          expect(carousel.page[3].x).to.equal(0);
          expect(carousel.page[4].x).to.equal(128);
          expect(carousel.page[5].x).to.equal(256);
          expect(carousel.page[6].x).to.equal(384);
          expect(carousel.page[7].x).to.equal(512);
          expect(carousel.page[8].x).to.equal(640);
        });
    });
  });

  describe('momentum', function () {

    describe('when data does not fill screen', function () {
      var el, carousel;

      beforeEach(function () {
        el = $('<div id="test" style="width: 320px;" />');
        el.appendTo('body');
        carousel = new Carousel({
          el: '#test',
          loop: false,
          pageWidth: 128,
          data: two
        });
        carousel.render();
      });

      afterEach(function () {
        el.remove();
      });

      it('aligns to left bound not right bound when flick to the left', function () {
        triggerTouches(carousel, [{"x":234,"page":0,"y":115,"timeStamp":1384293486624},{"x":233,"page":0,"y":115,"timeStamp":1384293486664},{"x":229,"page":0,"y":115,"timeStamp":1384293486682},{"x":221,"page":0,"y":115,"timeStamp":1384293486699},{"x":209,"page":0,"y":115,"timeStamp":1384293486716},{"x":196,"page":0,"y":115,"timeStamp":1384293486733},{"x":179,"page":0,"y":115,"timeStamp":1384293486751},{"x":159,"page":0,"y":115,"timeStamp":1384293486768},{"x":139,"page":0,"y":115,"timeStamp":1384293486785},{"x":119,"page":0,"y":115,"timeStamp":1384293486802},{"x":99,"page":0,"y":114,"timeStamp":1384293486819},{"x":85,"page":0,"y":113,"timeStamp":1384293486836},{"x":71,"page":0,"y":113,"timeStamp":1384293486856},{"x":59,"page":0,"y":113,"timeStamp":1384293486870},{"x":48,"page":0,"y":113,"timeStamp":1384293486887},{"x":43,"page":0,"y":112,"timeStamp":1384293486904},{"x":39,"page":0,"y":111,"timeStamp":1384293486921}]);
        expect(carousel.current.x).to.equal(0);
      });

    });

    describe('when data does at least fill screen', function() {
      var el, carousel;

      beforeEach(function () {
        el = $('<div id="test" style="width: 320px;" />');
        el.appendTo('body');
        carousel = new Carousel({
          el: '#test',
          loop: false,
          pageWidth: 128,
          data: five
        });
        carousel.render();
      });

      afterEach(function () {
        el.remove();
      });

      it('scrolls to bound when momentum is significant and bound limit is exceeded', function () {
        sinon.spy(carousel, "crossBoundary");
        triggerTouches(carousel, [{"x":296,"page":0,"y":114,"timeStamp":1384292561490},{"x":288,"page":0,"y":113,"timeStamp":1384292561504},{"x":268,"page":0,"y":113,"timeStamp":1384292561520},{"x":236,"page":0,"y":114,"timeStamp":1384292561538},{"x":198,"page":0,"y":116,"timeStamp":1384292561554},{"x":152,"page":0,"y":120,"timeStamp":1384292561570},{"x":96,"page":0,"y":129,"timeStamp":1384292561587},{"x":45,"page":0,"y":143,"timeStamp":1384292561605}]); 
        expect(carousel.crossBoundary).to.have.been.calledTwice;
        expect(carousel.crossBoundary.getCall(0)).to.have.been.calledWith(3, 4);
        expect(carousel.crossBoundary.getCall(1)).to.have.been.calledWith(4, 5);
        expect(carousel.current.page).to.equal(5);
      });

    });

    describe('fast swipes', function() {
      var el, carousel;

      beforeEach(function () {
        el = $('<div id="test" style="width: 320px;" />');
        el.appendTo('body');
        carousel = new Carousel({
          el: '#test',
          pageWidth: 128,
          data: eleven
        });
        carousel.render();
      });

      afterEach(function () {
        el.remove();
      });

      it('scrolls with momentum when quick flick gesture is used', function () {
        sinon.spy(carousel, "crossBoundary");
        triggerTouches(carousel,[{"x":311,"page":0,"y":64,"timeStamp":1384369891724},{"x":311,"page":0,"y":64,"timeStamp":1384369891740},{"x":298,"page":0,"y":64,"timeStamp":1384369891757},{"x":272,"page":0,"y":64,"timeStamp":1384369891783},{"x":208,"page":0,"y":64,"timeStamp":1384369891792},{"x":147,"page":0,"y":64,"timeStamp":1384369891809},{"x":82,"page":0,"y":59,"timeStamp":1384369891826},{"x":18,"page":0,"y":50,"timeStamp":1384369891843},{"x":0,"page":0,"y":43,"timeStamp":1384369891860}]); 
        expect(carousel.crossBoundary.callCount).to.equal(4);
        expect(carousel.crossBoundary.getCall(0)).to.have.been.calledWith(3, 4);
        expect(carousel.crossBoundary.getCall(1)).to.have.been.calledWith(4, 5);
        expect(carousel.crossBoundary.getCall(2)).to.have.been.calledWith(5, 6);
        expect(carousel.crossBoundary.getCall(3)).to.have.been.calledWith(6, 7);
        expect(carousel.current.page).to.equal(7);
      });

      it('limits exit velocity when flicking quickly', function () {
        triggerTouches(carousel, [{"x":296,"page":0,"y":82,"timeStamp":1384369592100},{"x":296,"page":0,"y":82,"timeStamp":1384369592104},{"x":293,"page":0,"y":82,"timeStamp":1384369592117},{"x":286,"page":0,"y":82,"timeStamp":1384369592134},{"x":272,"page":0,"y":82,"timeStamp":1384369592151},{"x":242,"page":0,"y":82,"timeStamp":1384369592168},{"x":191,"page":0,"y":82,"timeStamp":1384369592186},{"x":150,"page":0,"y":82,"timeStamp":1384369592203},{"x":92,"page":0,"y":82,"timeStamp":1384369592221},{"x":63,"page":0,"y":82,"timeStamp":1384369592237}]);
        expect(carousel.current.x).to.equal(-512); //velocity is not exposed, but we can check final position for this expectation
      });
    });
  });

  describe('buffer pages', function () {
    var el, carousel;

    it('it creates an ideal number of buffer pages for a 320px wide layout', function () {
      el = $('<div id="test" style="width: 320px;" />');
      el.appendTo('body');
      carousel = new Carousel({
        el: '#test',
        loop: false,
        data: eleven,
        pageWidth:128
      });
      carousel.render();

      expect(carousel.pages.side).to.equal(3);

      el.remove();
    });

    it('it creates an ideal number of buffer pages for a 480px wide layout', function () {
      el = $('<div id="test" style="width: 480px;" />');
      el.appendTo('body');
      carousel = new Carousel({
        el: '#test',
        loop: false,
        data: eleven,
        pageWidth:128
      });
      carousel.render();

      expect(carousel.pages.side).to.equal(4);

      el.remove();
    });

    it('it creates an ideal number of buffer pages for a 568px wide layout', function () {
      el = $('<div id="test" style="width: 568px;" />');
      el.appendTo('body');
      carousel = new Carousel({
        el: '#test',
        loop: false,
        data: eleven,
        pageWidth:128
      });
      carousel.render();

      expect(carousel.pages.side).to.equal(5);

      el.remove();
    });

    it('it creates an ideal number of buffer pages for a 768px wide layout', function () {
      el = $('<div id="test" style="width: 768px;" />');
      el.appendTo('body');
      carousel = new Carousel({
        el: '#test',
        loop: false,
        data: eleven,
        pageWidth:128
      });
      carousel.render();

      expect(carousel.pages.side).to.equal(6);

      el.remove();
    });

    it('it creates an ideal number of buffer pages for a 1024px wide layout', function () {
      el = $('<div id="test" style="width: 1024px;" />');
      el.appendTo('body');
      carousel = new Carousel({
        el: '#test',
        loop: false,
        data: eleven,
        pageWidth:128
      });
      carousel.render();

      expect(carousel.pages.side).to.equal(8);

      el.remove();
    });
  });

  describe('page snapping', function () {
    var el, carousel;

    beforeEach(function () {
      el = $('<div id="test" style="width: 320px;" />');
      el.appendTo('body');
      carousel = new Carousel({
        el: '#test',
        loop: false,
        data: eleven,
        pageWidth:128
      });
      carousel.render();
    });

    afterEach(function () {
      el.remove();
    });

    it('does not snap when momentum is not significant', function () {
      triggerTouches(carousel, [{"x":284,"page":0,"y":133,"timeStamp":1384184688783},{"x":283,"page":0,"y":133,"timeStamp":1384184688922},{"x":281,"page":0,"y":133,"timeStamp":1384184688939},{"x":279,"page":0,"y":133,"timeStamp":1384184688956},{"x":277,"page":0,"y":133,"timeStamp":1384184688975},{"x":275,"page":0,"y":133,"timeStamp":1384184689020},{"x":270,"page":0,"y":133,"timeStamp":1384184689037},{"x":265,"page":0,"y":133,"timeStamp":1384184689071},{"x":263,"page":0,"y":133,"timeStamp":1384184689084},{"x":261,"page":0,"y":133,"timeStamp":1384184689093},{"x":259,"page":0,"y":133,"timeStamp":1384184689123},{"x":257,"page":0,"y":133,"timeStamp":1384184689134},{"x":254,"page":0,"y":133,"timeStamp":1384184689144},{"x":250,"page":0,"y":133,"timeStamp":1384184689183},{"x":249,"page":0,"y":133,"timeStamp":1384184689195},{"x":247,"page":0,"y":132,"timeStamp":1384184689212},{"x":247,"page":0,"y":132,"timeStamp":1384184689257},{"x":245,"page":0,"y":131,"timeStamp":1384184689261},{"x":245,"page":0,"y":131,"timeStamp":1384184689271},{"x":243,"page":0,"y":131,"timeStamp":1384184689279},{"x":242,"page":0,"y":131,"timeStamp":1384184689307},{"x":240,"page":0,"y":131,"timeStamp":1384184689327},{"x":239,"page":0,"y":131,"timeStamp":1384184689333},{"x":238,"page":0,"y":130,"timeStamp":1384184689357},{"x":238,"page":0,"y":130,"timeStamp":1384184689378}])

      expect(carousel.current.x).to.equal(-54);
      expect(carousel.page[0].data).to.deep.equal({ content: '' });
      expect(carousel.page[1].data).to.deep.equal({ content: '' });
      expect(carousel.page[2].data).to.deep.equal({ content: '' });
      expect(carousel.page[3].data).to.deep.equal({ content: '0' });
      expect(carousel.page[4].data).to.deep.equal({ content: '1' });
      expect(carousel.page[5].data).to.deep.equal({ content: '2' });
      expect(carousel.page[6].data).to.deep.equal({ content: '3' });
      expect(carousel.page[7].data).to.deep.equal({ content: '4' });
      expect(carousel.page[8].data).to.deep.equal({ content: '5' });

      expect(carousel.page[0].x).to.equal(-384);
      expect(carousel.page[1].x).to.equal(-256);
      expect(carousel.page[2].x).to.equal(-128);
      expect(carousel.page[3].x).to.equal(0);
      expect(carousel.page[4].x).to.equal(128);
      expect(carousel.page[5].x).to.equal(256);
      expect(carousel.page[6].x).to.equal(384);
      expect(carousel.page[7].x).to.equal(512);
      expect(carousel.page[8].x).to.equal(640);
    });

    it('does snap when momentum is significant', function () {
      triggerTouches(carousel, [{"x":286,"page":0,"y":165,"timeStamp":1384184975988},{"x":285,"page":0,"y":165,"timeStamp":1384184976025},{"x":281,"page":0,"y":165,"timeStamp":1384184976044},{"x":272,"page":0,"y":165,"timeStamp":1384184976065},{"x":254,"page":0,"y":163,"timeStamp":1384184976082},{"x":227,"page":0,"y":158,"timeStamp":1384184976099},{"x":138,"page":0,"y":135,"timeStamp":1384184976129},{"x":109,"page":0,"y":131,"timeStamp":1384184976150}])

      expect(carousel.current.x).to.equal(-384);
      expect(carousel.page[0].data).to.deep.equal({ content: '6'});
      expect(carousel.page[1].data).to.deep.equal({ content: '7'});
      expect(carousel.page[2].data).to.deep.equal({ content: '8'});
      expect(carousel.page[3].data).to.deep.equal({ content: '0' });
      expect(carousel.page[4].data).to.deep.equal({ content: '1' });
      expect(carousel.page[5].data).to.deep.equal({ content: '2' });
      expect(carousel.page[6].data).to.deep.equal({ content: '3' });
      expect(carousel.page[7].data).to.deep.equal({ content: '4' });
      expect(carousel.page[8].data).to.deep.equal({ content: '5' });

      expect(carousel.page[0].x).to.equal(768);
      expect(carousel.page[1].x).to.equal(896);
      expect(carousel.page[2].x).to.equal(1024);
      expect(carousel.page[3].x).to.equal(0);
      expect(carousel.page[4].x).to.equal(128);
      expect(carousel.page[5].x).to.equal(256);
      expect(carousel.page[6].x).to.equal(384);
      expect(carousel.page[7].x).to.equal(512);
      expect(carousel.page[8].x).to.equal(640);
    });
  });

  describe('render sequence', function () {
    var el, carousel;

    it('appends visible pages first, right side then left side', function () {
      el = $('<div id="test" style="width: 320px;" />');
      el.appendTo('body');
      carousel = new Carousel({
        el: '#test',
        loop: false,
        data: eleven,
        pageWidth:128
      });

      sinon.spy(carousel.slider, 'append');
      carousel.render();
      expect(carousel.page.length).to.equal(9);
      expect(carousel.pages.visible.length).to.equal(3);
      expect(carousel.pages.visible).to.deep.equal([3, 4, 5]);
      expect(carousel.slider.append.callCount).to.equal(9);

      expect(carousel.slider.append.getCall(0)).to.have.been.calledWith(carousel.page[3].$el);
      expect(carousel.slider.append.getCall(1)).to.have.been.calledWith(carousel.page[4].$el);
      expect(carousel.slider.append.getCall(2)).to.have.been.calledWith(carousel.page[5].$el);
      expect(carousel.slider.append.getCall(3)).to.have.been.calledWith(carousel.page[6].$el);
      expect(carousel.slider.append.getCall(4)).to.have.been.calledWith(carousel.page[7].$el);
      expect(carousel.slider.append.getCall(5)).to.have.been.calledWith(carousel.page[8].$el);
      expect(carousel.slider.append.getCall(6)).to.have.been.calledWith(carousel.page[0].$el);
      expect(carousel.slider.append.getCall(7)).to.have.been.calledWith(carousel.page[1].$el);
      expect(carousel.slider.append.getCall(8)).to.have.been.calledWith(carousel.page[2].$el);

      el.remove();
    });

    it('delays rendering buffer page content until explicity requested', function () {
      el = $('<div id="test" style="width: 320px;" />');
      el.appendTo('body');
      carousel = new Carousel({
        el: '#test',
        loop: false,
        data: eleven,
        delayBuffers: true,
        pageWidth:128
      });

      sinon.spy(carousel, 'template');
      sinon.spy(carousel.slider, 'append');
      carousel.render();
      expect(carousel.page.length).to.equal(9);
      expect(carousel.pages.visible.length).to.equal(3);
      expect(carousel.pages.visible).to.deep.equal([3, 4, 5]);
      expect(carousel.slider.append.callCount).to.equal(9);
      expect(carousel.template.callCount).to.equal(3);

      expect(carousel.template.getCall(0).calledWith({ content: '0' })).to.be.ok;
      expect(carousel.template.getCall(1).calledWith({ content: '1' })).to.be.ok;
      expect(carousel.template.getCall(2).calledWith({ content: '2' })).to.be.ok;

      carousel.renderBuffers();
      expect(carousel.template.callCount).to.equal(9);
      expect(carousel.template.getCall(3).calledWith({ content: '3' })).to.be.ok;
      expect(carousel.template.getCall(4).calledWith({ content: '4' })).to.be.ok;
      expect(carousel.template.getCall(5).calledWith({ content: '5' })).to.be.ok;
      expect(carousel.template.getCall(6).calledWith({ content: '' })).to.be.ok;
      expect(carousel.template.getCall(7).calledWith({ content: '' })).to.be.ok;
      expect(carousel.template.getCall(8).calledWith({ content: '' })).to.be.ok;

      el.remove();
    });

    it('delays rendering buffer page content, but renders them if interaction occurs', function () {
      el = $('<div id="test" style="width: 320px;" />');
      el.appendTo('body');
      carousel = new Carousel({
        el: '#test',
        loop: false,
        data: eleven,
        delayBuffers: true,
        pageWidth:128
      });

      sinon.spy(carousel, 'template');
      sinon.spy(carousel, 'renderBuffers');
      carousel.render();

      triggerTouches(carousel, [{"x":268,"page":0,"y":136,"timeStamp":1384198647970},{"x":267,"page":0,"y":136,"timeStamp":1384198647984},{"x":266,"page":0,"y":136,"timeStamp":1384198648003},{"x":263,"page":0,"y":136,"timeStamp":1384198648024},{"x":260,"page":0,"y":136,"timeStamp":1384198648045},{"x":256,"page":0,"y":136,"timeStamp":1384198648057},{"x":254,"page":0,"y":136,"timeStamp":1384198648074},{"x":250,"page":0,"y":136,"timeStamp":1384198648091},{"x":247,"page":0,"y":136,"timeStamp":1384198648108},{"x":246,"page":0,"y":136,"timeStamp":1384198648125},{"x":244,"page":0,"y":136,"timeStamp":1384198648142},{"x":243,"page":0,"y":136,"timeStamp":1384198648158},{"x":242,"page":0,"y":136,"timeStamp":1384198648175},{"x":242,"page":0,"y":136,"timeStamp":1384198648191}]);
      expect(carousel.renderBuffers).to.have.been.calledTwice;

      expect(carousel.template.callCount).to.equal(9);
      expect(carousel.template.getCall(3).calledWith({ content: '3' })).to.be.ok;
      expect(carousel.template.getCall(4).calledWith({ content: '4' })).to.be.ok;
      expect(carousel.template.getCall(5).calledWith({ content: '5' })).to.be.ok;
      expect(carousel.template.getCall(6).calledWith({ content: '' })).to.be.ok;
      expect(carousel.template.getCall(7).calledWith({ content: '' })).to.be.ok;
      expect(carousel.template.getCall(8).calledWith({ content: '' })).to.be.ok;

      el.remove();
    });
  });

  describe('orientation changes', function () {
    var el, carousel;

    beforeEach(function () {
      el = $('<div id="test" style="width: 320px;" />');
      el.appendTo('body');
      carousel = new Carousel({
        el: '#test',
        loop: false,
        data: five,
        pageWidth:128
      });
      carousel.render();
    });

    afterEach(function () {
      el.remove();
    });

    it('updates the container width', function () {
      expect(carousel.container.width).to.equal(320);
      triggerResize(carousel, 480);
      expect(carousel.container.width).to.equal(480);
    });

    it('updates limits', function () {
      expect(carousel.limit).to.deep.equal({ left: { x: 0 }, right: { x: -320 } });
      triggerResize(carousel, 480);
      expect(carousel.limit).to.deep.equal({ left: { x: 0 }, right: { x: -160 } });
    });

    it('repositions carousel slider if it is no longer in carousel limits', function () {
      triggerTouches(carousel, [{"x":314,"page":0,"y":111,"timeStamp":1384370967381},{"x":313,"page":0,"y":111,"timeStamp":1384370967782},{"x":309,"page":0,"y":111,"timeStamp":1384370967800},{"x":298,"page":0,"y":111,"timeStamp":1384370967825},{"x":272,"page":0,"y":111,"timeStamp":1384370967840},{"x":240,"page":0,"y":110,"timeStamp":1384370967857},{"x":204,"page":0,"y":106,"timeStamp":1384370967871},{"x":169,"page":0,"y":100,"timeStamp":1384370967889},{"x":134,"page":0,"y":93,"timeStamp":1384370967906},{"x":95,"page":0,"y":85,"timeStamp":1384370967922},{"x":66,"page":0,"y":82,"timeStamp":1384370967938},{"x":49,"page":0,"y":82,"timeStamp":1384370967955}]);
      triggerResize(carousel, 480);
      expect(carousel.current.x).to.equal(-160);
    });
  });

  describe('management of image loading', function () {
    describe('a single carousel instance', function () {
      var el, carousel;

      beforeEach(function () {
        el = $('<div id="test" style="width: 320px;" />');
        el.appendTo('body');
        carousel = new Carousel({
          el: '#test',
          loop: false,
          data: elevenImages,
          manageImages: true,
          pageWidth:128,
          template: function (data, options) {
            data = data || {};
            data.url = data.url || '';
            return '<img src="' + data.url + '" />';
          }
        });
      });

      afterEach(function () {
        el.remove();
      });

      it('only loads visible images first', function (done) {
        carousel.render();
        carousel.$el.imagesLoaded(function (instance) {
          expect(instance.images.length).to.equal(3);
          expect(instance.images[0].img.src).to.equal('http://placehold.it/128x200/D5FBFF');
          expect(instance.images[1].img.src).to.equal('http://placehold.it/128x200/9FBCBF');
          expect(instance.images[2].img.src).to.equal('http://placehold.it/128x200/647678');
          done();
        });
      });
    });


    describe('multiple carousel instances', function () {
      var el, el2, el3, carousel1, carousel2, carousel3;

      beforeEach(function () {
        el = $('<div id="test" style="width: 320px;" />');
        el2 = $('<div id="test2" style="width: 320px;" />');
        el3 = $('<div id="test3" style="width: 320px;" />');
        el.appendTo('body');
        el2.appendTo('body');
        el3.appendTo('body');
        carousel = new Carousel({
          el: '#test',
          loop: false,
          data: fiveImages1,
          manageImages: true,
          pageWidth:128,
          template: function (data, options) {
            data = data || {};
            data.url = data.url || '';
            return '<img src="' + data.url + '" />';
          }
        });
        carousel2 = new Carousel({
          el: '#test2',
          loop: false,
          data: fiveImages2,
          manageImages: true,
          pageWidth:128,
          template: function (data, options) {
            data = data || {};
            data.url = data.url || '';
            return '<img src="' + data.url + '" />';
          }
        });
        carousel3 = new Carousel({
          el: '#test3',
          loop: false,
          data: fiveImages3,
          manageImages: true,
          pageWidth:128,
          template: function (data, options) {
            data = data || {};
            data.url = data.url || '';
            return '<img src="' + data.url + '" />';
          }
        });
      });

      afterEach(function () {
        el.remove();
      });

      it('loads visible images for all instances first', function (done) {
        var count = 0;
        carousel.render();
        carousel2.render();
        carousel3.render();
        carousel.$el.imagesLoaded(function (instance) {
          expect(instance.images.length).to.equal(3);
          expect(instance.images[0].img.src).to.equal('http://placehold.it/128x200/D5FBFF');
          expect(instance.images[1].img.src).to.equal('http://placehold.it/128x200/9FBCBF');
          expect(instance.images[2].img.src).to.equal('http://placehold.it/128x200/647678');
          expect(carousel.rendered).to.equal(false);
          expect(carousel2.rendered).to.equal(false);
          expect(carousel3.rendered).to.equal(false);
          count++;
          expect(count).to.equal(1);
        });
        carousel2.$el.imagesLoaded(function (instance) {
          expect(instance.images.length).to.equal(3);
          expect(instance.images[0].img.src).to.equal('http://placehold.it/128x200/85DB18');
          expect(instance.images[1].img.src).to.equal('http://placehold.it/128x200/CDE855');
          expect(instance.images[2].img.src).to.equal('http://placehold.it/128x200/F5F6D4');
          expect(carousel.rendered).to.equal(false);
          expect(carousel2.rendered).to.equal(false);
          expect(carousel3.rendered).to.equal(false);
          count++;
          expect(count).to.equal(2);
        });
        carousel3.$el.imagesLoaded(function (instance) {
          expect(instance.images.length).to.equal(3);
          expect(instance.images[0].img.src).to.equal('http://placehold.it/128x200/DC3522');
          expect(instance.images[1].img.src).to.equal('http://placehold.it/128x200/D9CB9E');
          expect(instance.images[2].img.src).to.equal('http://placehold.it/128x200/374140');
          count++;
          expect(count).to.equal(3);
          expect(carousel.rendered).to.equal(false);
          expect(carousel2.rendered).to.equal(false);
          expect(carousel3.rendered).to.equal(false);
          _.delay(function () {
            expect(carousel.rendered).to.equal(true);
            expect(carousel2.rendered).to.equal(true);
            expect(carousel3.rendered).to.equal(true);
            done();
          }, 10);
        });
      });
    });
  });
})
