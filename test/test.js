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

function makeTouchEvent (x) {
  return { originalEvent: { touches: [ { pageX: x} ] } };
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
    ];

  it('can be instantiated', function () {
    var carousel = new Carousel();
    expect(carousel).to.not.be.undefined;
  });

  describe('options', function () {
    it('has the correct default values', function () {
      var carousel = new Carousel();
      var carouselOptions = [
        'loop',
        'bufferPages'
      ];
      var pickedOptions = _.pick(carousel, carouselOptions);

      expect(pickedOptions).to.deep.equal({
        loop: true,
        bufferPages: 2
      });
    });

    it('allows defaults to be overridden', function () {
      var carousel = new Carousel({
        loop: false,
        bufferPages: 4
      });
      var carouselOptions = ['loop', 'bufferPages'];
      var pickedOptions = _.pick(carousel, carouselOptions);

      expect(pickedOptions).to.deep.equal({
        loop: false,
        bufferPages: 4
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
        transitionTimingFunction: 'ease-out',
        transform: 'translate3d(0px, 0px, 0px)'
      });
    });
  });

  describe('initial layout', function () {

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
        expect(carousel.page.length).to.equal(5);

        expect(carousel.page[0].data).to.deep.equal({ content: '9' });
        expect(carousel.page[1].data).to.deep.equal({ content: '10' });
        expect(carousel.page[2].data).to.deep.equal({ content: '0' });
        expect(carousel.page[3].data).to.deep.equal({ content: '1' });
        expect(carousel.page[4].data).to.deep.equal({ content: '2' });

        expect(carousel.page[0].x).to.equal(-512);
        expect(carousel.page[1].x).to.equal(-256);
        expect(carousel.page[2].x).to.equal(0);
        expect(carousel.page[3].x).to.equal(256);
        expect(carousel.page[4].x).to.equal(512);
      });

      it('handles data.length < page.length', function () {
        var carousel = new Carousel({
          el: '#test',
          data: two
        });
        carousel.render();
        expect(carousel.current.page).to.equal(2);
        expect(carousel.page[0].data).to.deep.equal({ content: '0' });
        expect(carousel.page[1].data).to.deep.equal({ content: '1' });
        expect(carousel.page[2].data).to.deep.equal({ content: '0' });
        expect(carousel.page[3].data).to.deep.equal({ content: '1' });
        expect(carousel.page[4].data).to.deep.equal({ content: '0' });

        expect(carousel.page[0].x).to.equal(-512);
        expect(carousel.page[1].x).to.equal(-256);
        expect(carousel.page[2].x).to.equal(0);
        expect(carousel.page[3].x).to.equal(256);
        expect(carousel.page[4].x).to.equal(512);
      });

      it('handles data.length one less then page.length', function () {
        var carousel = new Carousel({
          el: '#test',
          data: four
        });
        carousel.render();
        expect(carousel.current.page).to.equal(2);
        expect(carousel.page[0].data).to.deep.equal({ content: '2' });
        expect(carousel.page[1].data).to.deep.equal({ content: '3' });
        expect(carousel.page[2].data).to.deep.equal({ content: '0' });
        expect(carousel.page[3].data).to.deep.equal({ content: '1' });
        expect(carousel.page[4].data).to.deep.equal({ content: '2' });

        expect(carousel.page[0].x).to.equal(-512);
        expect(carousel.page[1].x).to.equal(-256);
        expect(carousel.page[2].x).to.equal(0);
        expect(carousel.page[3].x).to.equal(256);
        expect(carousel.page[4].x).to.equal(512);
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

        expect(carousel.page[0].x).to.equal(-512);
        expect(carousel.page[1].x).to.equal(-256);
        expect(carousel.page[2].x).to.equal(0);
        expect(carousel.page[3].x).to.equal(256);
        expect(carousel.page[4].x).to.equal(512);
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
        expect(carousel.current.page).to.equal(0);
        expect(carousel.page.length).to.equal(5);

        expect(carousel.page[0].data).to.deep.equal({ content: '0' });
        expect(carousel.page[1].data).to.deep.equal({ content: '1' });
        expect(carousel.page[2].data).to.deep.equal({ content: '2' });
        expect(carousel.page[3].data).to.deep.equal({ content: '3' });
        expect(carousel.page[4].data).to.deep.equal({ content: '4' });

        expect(carousel.page[0].x).to.equal(0);
        expect(carousel.page[1].x).to.equal(256);
        expect(carousel.page[2].x).to.equal(512);
        expect(carousel.page[3].x).to.equal(768);
        expect(carousel.page[4].x).to.equal(1024);
      });

      it('handles data.length < page.length', function () {
        var carousel = new Carousel({
          el: '#test',
          loop: false,
          data: two
        });
        carousel.render();
        expect(carousel.current.page).to.equal(0);
        expect(carousel.page.length).to.equal(2);
        expect(carousel.page[0].data).to.deep.equal({ content: '0' });
        expect(carousel.page[1].data).to.deep.equal({ content: '1' });

        expect(carousel.page[0].x).to.equal(0);
        expect(carousel.page[1].x).to.equal(256);
      });

      it('handles data.length one less then page.length', function () {
        var carousel = new Carousel({
          el: '#test',
          loop: false,
          data: four
        });
        carousel.render();
        expect(carousel.current.page).to.equal(0);
        expect(carousel.page.length).to.equal(4);
        expect(carousel.page[0].data).to.deep.equal({ content: '0' });
        expect(carousel.page[1].data).to.deep.equal({ content: '1' });
        expect(carousel.page[2].data).to.deep.equal({ content: '2' });
        expect(carousel.page[3].data).to.deep.equal({ content: '3' });

        expect(carousel.page[0].x).to.equal(0);
        expect(carousel.page[1].x).to.equal(256);
        expect(carousel.page[2].x).to.equal(512);
        expect(carousel.page[3].x).to.equal(768);
      });

      it('handles data.length = 1', function () {
        var carousel = new Carousel({
          el: '#test',
          loop: false,
          data: one
        });
        carousel.render();
        expect(carousel.current.page).to.equal(0);
        expect(carousel.page.length).to.equal(1);
        expect(carousel.page[0].data).to.deep.equal({ content: '0' });
        expect(carousel.page[0].x).to.equal(0);
      });
    });
  }); //describe initial layout

  describe('page management', function () {
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
          triggerTouches(carousel, [ 303, 238 ]);
          expect(carousel.crossBoundary).to.not.to.been.called;
          expect(carousel.current.page).to.equal(2);
        });

        it('advances to the next page when crossing a single page boundary', function () {
          sinon.spy(carousel, "crossBoundary");
          triggerTouches(carousel, [297, 297, 293, 286, 271, 228, 192, 159, 124, 94, 72, 56, 42, 29, 22, 17, 14, 13]);
          expect(carousel.crossBoundary).to.have.been.calledOnce;
          expect(carousel.current.page).to.equal(3);

          expect(carousel.page[1].data).to.deep.equal({ content: '10' });
          expect(carousel.page[2].data).to.deep.equal({ content: '0' });
          expect(carousel.page[3].data).to.deep.equal({ content: '1' });
          expect(carousel.page[4].data).to.deep.equal({ content: '2' });
          expect(carousel.page[0].data).to.deep.equal({ content: '3' });

          expect(carousel.page[1].dataIndex).to.equal(10);
          expect(carousel.page[2].dataIndex).to.equal(0);
          expect(carousel.page[3].dataIndex).to.equal(1);
          expect(carousel.page[4].dataIndex).to.equal(2);
          expect(carousel.page[0].dataIndex).to.equal(3);

          expect(carousel.page[1].x).to.equal(-256);
          expect(carousel.page[2].x).to.equal(0);
          expect(carousel.page[3].x).to.equal(256);
          expect(carousel.page[4].x).to.equal(512);
          expect(carousel.page[0].x).to.equal(768);
        });
      });

      describe('when swiping to the right (show more on the left)', function () {
        it('only advances the current page when crossing a page boundary', function () {
          sinon.spy(carousel, "crossBoundary");
          triggerTouches(carousel, [ 58, 108 ]);
          expect(carousel.crossBoundary).to.have.been.calledOnce;
          expect(carousel.current.page).to.equal(1);

          triggerTouches(carousel, [ 108, 152 ]);
          expect(carousel.crossBoundary).to.have.been.calledOnce;
          expect(carousel.current.page).to.equal(1);

          expect(carousel.page[4].data).to.deep.equal({ content: '8' });
          expect(carousel.page[0].data).to.deep.equal({ content: '9' });
          expect(carousel.page[1].data).to.deep.equal({ content: '10' });
          expect(carousel.page[2].data).to.deep.equal({ content: '0' });
          expect(carousel.page[3].data).to.deep.equal({ content: '1' });

          expect(carousel.page[4].dataIndex).to.equal(8);
          expect(carousel.page[0].dataIndex).to.equal(9);
          expect(carousel.page[1].dataIndex).to.equal(10);
          expect(carousel.page[2].dataIndex).to.equal(0);
          expect(carousel.page[3].dataIndex).to.equal(1);

          expect(carousel.page[4].x).to.equal(-768);
          expect(carousel.page[0].x).to.equal(-512);
          expect(carousel.page[1].x).to.equal(-256);
          expect(carousel.page[2].x).to.equal(0);
          expect(carousel.page[3].x).to.equal(256);
        });

      });
    });
    describe('when not looping', function () {
    });
  });
})
